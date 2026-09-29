import csv
import io
from decimal import Decimal
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.core.permissions import HasPermission
from apps.menu.models import (
    Category, MenuItem, ItemVariant,
    ModifierGroup, ModifierOption, MenuItemModifier
)
from apps.menu.serializers import (
    CategorySerializer, MenuItemSerializer,
    ItemVariantSerializer, ModifierGroupSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Menu Category CRUD and sorting.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    search_fields = ['name', 'description']

    def get_queryset(self):
        return Category.objects.filter(is_deleted=False).order_by('sort_order', 'name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])
        return Response({
            'success': True,
            'message': f'Category "{instance.name}" deleted successfully'
        }, status=status.HTTP_200_OK)


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    Menu Item CRUD, availability toggles, and CSV/Excel import/export.
    """
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    search_fields = ['name', 'description', 'sku']

    def get_queryset(self):
        queryset = MenuItem.objects.filter(
            is_deleted=False
        ).select_related('category').prefetch_related('variants', 'item_modifiers__modifier_group__options')

        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        available_only = self.request.query_params.get('available')
        if available_only in ['true', '1']:
            queryset = queryset.filter(is_available=True)

        return queryset.order_by('name')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted'])
        return Response({
            'success': True,
            'message': f'Menu item "{instance.name}" deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        item = self.get_object()
        item.is_available = not item.is_available
        item.save(update_fields=['is_available'])
        return Response({
            'success': True,
            'message': f'Item is now {"available" if item.is_available else "unavailable"}',
            'data': {'is_available': item.is_available}
        })

    @action(detail=False, methods=['post'], url_path='import-file')
    def import_file(self, request):
        """
        Bulk import menu items from CSV or Excel file.
        Format columns: Category, Name, Description, BasePrice, Sizes, PrepTime, Dietary
        Example Sizes: Small:9.99|Medium:13.99|Large:17.99
        """
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({
                'success': False,
                'message': 'Please select a CSV or Excel file to upload.'
            }, status=status.HTTP_400_BAD_REQUEST)

        filename = uploaded_file.name.lower()
        rows = []

        try:
            if filename.endswith('.csv') or filename.endswith('.txt'):
                decoded_file = uploaded_file.read().decode('utf-8-sig', errors='replace')
                io_string = io.StringIO(decoded_file)
                reader = csv.DictReader(io_string)
                rows = list(reader)
            elif filename.endswith(('.xlsx', '.xls')):
                try:
                    import openpyxl
                    wb = openpyxl.load_workbook(uploaded_file, data_only=True)
                    sheet = wb.active
                    headers = [str(cell.value or '').strip() for cell in sheet[1]]
                    for row_cells in sheet.iter_rows(min_row=2, values_only=True):
                        if any(row_cells):
                            row_dict = {}
                            for h, val in zip(headers, row_cells):
                                if h:
                                    row_dict[h] = str(val or '').strip()
                            rows.append(row_dict)
                except ImportError:
                    # Fallback if openpyxl not installed: guide user to CSV
                    return Response({
                        'success': False,
                        'message': 'Excel format requires openpyxl. Please upload CSV format or save sheet as CSV.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'success': False,
                    'message': 'Unsupported file extension. Please upload a .csv or .xlsx file.'
                }, status=status.HTTP_400_BAD_REQUEST)

            imported_count = 0
            created_categories = {}

            for row in rows:
                # Find column keys case-insensitively
                clean_row = {k.strip().lower(): str(v).strip() for k, v in row.items() if k}

                cat_name = clean_row.get('category') or clean_row.get('category_name') or 'General'
                item_name = clean_row.get('name') or clean_row.get('item_name')
                if not item_name:
                    continue

                description = clean_row.get('description', '')
                price_str = clean_row.get('price') or clean_row.get('baseprice') or clean_row.get('base_price') or '0.00'
                try:
                    base_price = Decimal(price_str.replace('$', '').replace(',', '').strip())
                except Exception:
                    base_price = Decimal('0.00')

                prep_time_str = clean_row.get('preptime') or clean_row.get('prep_time') or '15'
                try:
                    prep_time = int(prep_time_str)
                except Exception:
                    prep_time = 15

                dietary = clean_row.get('dietary', '').lower()
                is_veg = 'veg' in dietary
                is_vegan = 'vegan' in dietary
                is_spicy = 'spicy' in dietary or 'hot' in dietary
                is_gf = 'gluten' in dietary or 'gf' in dietary

                # Get or create Category
                if cat_name not in created_categories:
                    category, _ = Category.objects.get_or_create(
                        name=cat_name,
                        defaults={'description': f'{cat_name} category'}
                    )
                    created_categories[cat_name] = category
                else:
                    category = created_categories[cat_name]

                # Create MenuItem
                menu_item = MenuItem.objects.create(
                    category=category,
                    name=item_name,
                    description=description,
                    base_price=base_price,
                    prep_time_minutes=prep_time,
                    is_vegetarian=is_veg,
                    is_vegan=is_vegan,
                    is_gluten_free=is_gf,
                    is_spicy=is_spicy,
                    is_available=True,
                )

                # Parse Size Variants if provided
                # Format: Small:9.99|Medium:13.99|Large:17.99
                sizes_str = clean_row.get('sizes') or clean_row.get('variants', '')
                if sizes_str:
                    size_entries = sizes_str.split('|')
                    for entry in size_entries:
                        if ':' in entry:
                            v_name, v_price_str = entry.split(':', 1)
                            try:
                                v_price = Decimal(v_price_str.replace('$', '').strip())
                                ItemVariant.objects.create(
                                    item=menu_item,
                                    name=v_name.strip(),
                                    price=v_price
                                )
                            except Exception:
                                pass

                imported_count += 1

            return Response({
                'success': True,
                'message': f'Successfully imported {imported_count} menu items across {len(created_categories)} categories.',
                'data': {'imported_count': imported_count, 'categories': list(created_categories.keys())}
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to process file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request):
        """
        Download standard sample CSV template for menu import.
        """
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="restaurantos_menu_template.csv"'

        writer = csv.writer(response)
        writer.writerow(['Category', 'Name', 'Description', 'BasePrice', 'Sizes', 'PrepTime', 'Dietary'])
        writer.writerow(['Pizzas', 'Margherita Supreme', 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil', '14.50', 'Small:11.50|Medium:14.50|Large:18.50', '12', 'Vegetarian'])
        writer.writerow(['Pizzas', 'Diavola Pepperoni', 'Spicy salami, red chili flakes, mozzarella, organic honey drizzle', '16.00', 'Small:13.00|Medium:16.00|Large:20.50', '14', 'Spicy'])
        writer.writerow(['Burgers', 'Truffle Smash Burger', 'Double angus beef, black truffle aioli, aged cheddar, brioche bun', '15.90', 'Single:13.50|Double:15.90|Triple:19.50', '10', ''])
        writer.writerow(['Pasta', 'Truffle Tagliatelle', 'Handmade egg pasta, wild mushroom cream, parmigiano reggiano', '18.50', '', '15', 'Vegetarian'])
        writer.writerow(['Beverages', 'San Pellegrino Sparkling', '500ml Italian mineral sparkling water', '4.00', '', '2', 'Vegan, Gluten-Free'])
        writer.writerow(['Desserts', 'Artisan Tiramisu', 'Savoiardi soaked in espresso, mascarpone mousse, cocoa dust', '8.50', '', '5', 'Vegetarian'])

        return response


class ModifierGroupViewSet(viewsets.ModelViewSet):
    """
    Modifier group and options CRUD.
    """
    serializer_class = ModifierGroupSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return ModifierGroup.objects.filter(is_deleted=False).prefetch_related('options')
