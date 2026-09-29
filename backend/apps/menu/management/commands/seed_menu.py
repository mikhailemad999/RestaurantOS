from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.menu.models import Category, MenuItem, ItemVariant, ModifierGroup, ModifierOption, MenuItemModifier
from apps.restaurant.models import Restaurant


class Command(BaseCommand):
    help = 'Seeds initial restaurant menu categories, items, sizes, and modifier groups.'

    def handle(self, *args, **options):
        restaurant = Restaurant.objects.first()

        self.stdout.write('Seeding Menu Categories and Items...')

        # 1. Categories
        categories_data = [
            {'name': 'Artisan Pizzas', 'description': 'Handcrafted wood-fired sourdough pizzas with Italian toppings', 'sort_order': 1},
            {'name': 'Gourmet Burgers', 'description': 'Double smashed angus beef patties on toasted brioche buns', 'sort_order': 2},
            {'name': 'Handmade Pastas', 'description': 'Daily freshly rolled pasta with slow-simmered sauces', 'sort_order': 3},
            {'name': 'Beverages & Mocktails', 'description': 'Refreshing cold presses, Italian sodas, and artisan mocktails', 'sort_order': 4},
            {'name': 'Desserts', 'description': 'Authentic classic pastries and decadent sweet endings', 'sort_order': 5},
        ]

        cats = {}
        for cdata in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=cdata['name'],
                defaults={
                    'restaurant': restaurant,
                    'description': cdata['description'],
                    'sort_order': cdata['sort_order'],
                    'is_active': True,
                }
            )
            cats[cdata['name']] = cat

        # 2. Modifier Groups
        mod_crust, _ = ModifierGroup.objects.get_or_create(
            name='Pizza Crust Choice',
            defaults={
                'restaurant': restaurant,
                'min_selection': 1,
                'max_selection': 1,
                'is_required': True,
            }
        )
        for opt_name, opt_price in [('Traditional Neapolitan Sourdough', Decimal('0.00')), ('Gluten-Free Cauliflower Crust', Decimal('3.50')), ('Stuffed Garlic Mozzarella Crust', Decimal('4.00'))]:
            ModifierOption.objects.get_or_create(modifier_group=mod_crust, name=opt_name, defaults={'price': opt_price})

        mod_toppings, _ = ModifierGroup.objects.get_or_create(
            name='Extra Pizza Toppings',
            defaults={
                'restaurant': restaurant,
                'min_selection': 0,
                'max_selection': 5,
                'is_required': False,
            }
        )
        for opt_name, opt_price in [('Extra Buffalo Mozzarella', Decimal('2.50')), ('Crispy Beef Pepperoni', Decimal('3.00')), ('Truffle Mushroom Cream', Decimal('2.75')), ('Fresh Sweet Basil', Decimal('1.00'))]:
            ModifierOption.objects.get_or_create(modifier_group=mod_toppings, name=opt_name, defaults={'price': opt_price})

        mod_sides, _ = ModifierGroup.objects.get_or_create(
            name='Burger Sides & Dips',
            defaults={
                'restaurant': restaurant,
                'min_selection': 0,
                'max_selection': 2,
                'is_required': False,
            }
        )
        for opt_name, opt_price in [('Truffle Parmesan Fries', Decimal('4.50')), ('Sweet Potato Wedges', Decimal('4.00')), ('House Special Smoked BBQ Dip', Decimal('1.50'))]:
            ModifierOption.objects.get_or_create(modifier_group=mod_sides, name=opt_name, defaults={'price': opt_price})

        # 3. Menu Items
        items_data = [
            # Pizzas
            {
                'cat': 'Artisan Pizzas',
                'name': 'Margherita D.O.P.',
                'desc': 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh organic basil, extra virgin olive oil',
                'price': Decimal('14.50'),
                'prep': 12,
                'veg': True,
                'spicy': False,
                'variants': [('10" Personal', Decimal('11.50')), ('12" Regular', Decimal('14.50')), ('16" Family Large', Decimal('19.00'))],
                'modifiers': [mod_crust, mod_toppings]
            },
            {
                'cat': 'Artisan Pizzas',
                'name': 'Spicy Diavola Pepperoni',
                'desc': 'Artisan spicy beef pepperoni, hot calabrian chilies, mozzarella, organic spicy hot honey drizzle',
                'price': Decimal('16.90'),
                'prep': 14,
                'veg': False,
                'spicy': True,
                'variants': [('10" Personal', Decimal('13.50')), ('12" Regular', Decimal('16.90')), ('16" Family Large', Decimal('22.00'))],
                'modifiers': [mod_crust, mod_toppings]
            },
            {
                'cat': 'Artisan Pizzas',
                'name': 'Tartufo & Wild Mushroom',
                'desc': 'Roasted portobello & cremini mushrooms, black truffle cream base, fior di latte mozzarella, thyme',
                'price': Decimal('17.50'),
                'prep': 14,
                'veg': True,
                'spicy': False,
                'variants': [('10" Personal', Decimal('14.00')), ('12" Regular', Decimal('17.50')), ('16" Family Large', Decimal('23.50'))],
                'modifiers': [mod_crust, mod_toppings]
            },

            # Burgers
            {
                'cat': 'Gourmet Burgers',
                'name': 'Truffle Angus Smash Burger',
                'desc': 'Two smashed prime beef patties, black truffle garlic aioli, aged sharp cheddar, caramelized onions, brioche',
                'price': Decimal('16.50'),
                'prep': 10,
                'veg': False,
                'spicy': False,
                'variants': [('Single Patty (5oz)', Decimal('13.50')), ('Double Smash (10oz)', Decimal('16.50')), ('Triple Monster (15oz)', Decimal('19.90'))],
                'modifiers': [mod_sides]
            },
            {
                'cat': 'Gourmet Burgers',
                'name': 'Crispy Nashville Hot Chicken',
                'desc': 'Buttermilk fried chicken breast, cayenne chili glaze, crunchy cabbage slaw, dill pickles, comeback sauce',
                'price': Decimal('14.90'),
                'prep': 12,
                'veg': False,
                'spicy': True,
                'variants': [('Mild Heat', Decimal('14.90')), ('Medium Fire', Decimal('14.90')), ('Extreme Nashville Reaper', Decimal('15.50'))],
                'modifiers': [mod_sides]
            },

            # Pastas
            {
                'cat': 'Handmade Pastas',
                'name': 'Handmade Truffle Tagliatelle',
                'desc': 'Silky ribbons of fresh egg pasta, creamy wild mushroom sauce, 24-month parmigiano reggiano, shaved truffles',
                'price': Decimal('18.90'),
                'prep': 15,
                'veg': True,
                'spicy': False,
                'variants': [],
                'modifiers': []
            },
            {
                'cat': 'Handmade Pastas',
                'name': 'Slow-Braised Bolognese Rigatoni',
                'desc': '12-hour slow braised beef & veal ragù, bronze-die extruded rigatoni pasta, fresh stracciatella cheese',
                'price': Decimal('17.50'),
                'prep': 12,
                'veg': False,
                'spicy': False,
                'variants': [],
                'modifiers': []
            },

            # Beverages
            {
                'cat': 'Beverages & Mocktails',
                'name': 'Passionfruit Mint Spritz',
                'desc': 'Fresh passionfruit pulp, crushed garden mint, Sicilian lemon juice, sparkling mineral soda water',
                'price': Decimal('6.50'),
                'prep': 4,
                'veg': True,
                'spicy': False,
                'variants': [('Regular (16oz)', Decimal('6.50')), ('Large (24oz)', Decimal('8.00'))],
                'modifiers': []
            },
            {
                'cat': 'Beverages & Mocktails',
                'name': 'Artisan Iced Caramel Macchiato',
                'desc': 'Double shot single-origin espresso, cold frothed oat milk, housemade salted butter caramel drizzle',
                'price': Decimal('5.80'),
                'prep': 3,
                'veg': True,
                'spicy': False,
                'variants': [('Small (12oz)', Decimal('4.80')), ('Regular (16oz)', Decimal('5.80')), ('Large (20oz)', Decimal('6.80'))],
                'modifiers': []
            },

            # Desserts
            {
                'cat': 'Desserts',
                'name': 'Classic Venetian Tiramisu',
                'desc': 'Savoiardi ladyfingers soaked in dark espresso & amaretto essence, whipped mascarpone cream, dark cocoa dust',
                'price': Decimal('8.50'),
                'prep': 3,
                'veg': True,
                'spicy': False,
                'variants': [],
                'modifiers': []
            },
            {
                'cat': 'Desserts',
                'name': 'Molten Lava Chocolate Cake',
                'desc': 'Warm Belgian dark chocolate cake with a molten center, served with Madagascan bourbon vanilla bean gelato',
                'price': Decimal('9.50'),
                'prep': 8,
                'veg': True,
                'spicy': False,
                'variants': [],
                'modifiers': []
            },
        ]

        for item_data in items_data:
            cat = cats[item_data['cat']]
            item, _ = MenuItem.objects.get_or_create(
                category=cat,
                name=item_data['name'],
                defaults={
                    'restaurant': restaurant,
                    'description': item_data['desc'],
                    'base_price': item_data['price'],
                    'prep_time_minutes': item_data['prep'],
                    'is_vegetarian': item_data['veg'],
                    'is_spicy': item_data['spicy'],
                    'is_available': True,
                }
            )

            # Add variants
            for v_name, v_price in item_data['variants']:
                ItemVariant.objects.get_or_create(
                    item=item,
                    name=v_name,
                    defaults={'price': v_price}
                )

            # Add modifiers
            for mod_group in item_data['modifiers']:
                MenuItemModifier.objects.get_or_create(
                    item=item,
                    modifier_group=mod_group
                )

        self.stdout.write(self.style.SUCCESS('[OK] Menu seeded successfully with categories, items, sizes, and modifier groups!'))
