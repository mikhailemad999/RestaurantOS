import os
import django
from decimal import Decimal
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurantos_backend.settings')
django.setup()

from api.models import (
    StationProfile, PrinterDevice, PrinterRoutingRule, KitchenPrintJob,
    MenuItem, MenuCategory, Order
)

def seed_printer_system():
    print("[+] Seeding Kitchen Stations, Printers, and Routing Rules...")

    # 1. Kitchen Stations
    stations = [
        {
            'code': 'PIZZA',
            'name_en': 'Pizza Station',
            'name_ar': 'قسم البيتزا',
            'sla_minutes': 14,
            'display_color': '#f2ca50',
            'priority_level': 'NORMAL',
            'sort_order': 1,
            'screen_route': '/kitchen/station/PIZZA'
        },
        {
            'code': 'SANDWICH',
            'name_en': 'Sandwich & Burgers',
            'name_ar': 'قسم الساندوتشات والبرجر',
            'sla_minutes': 10,
            'display_color': '#ff949c',
            'priority_level': 'NORMAL',
            'sort_order': 2,
            'screen_route': '/kitchen/station/SANDWICH'
        },
        {
            'code': 'GRILL',
            'name_en': 'Grill & Steaks',
            'name_ar': 'قسم الجريل واللحوم',
            'sla_minutes': 16,
            'display_color': '#e9c349',
            'priority_level': 'HIGH',
            'sort_order': 3,
            'screen_route': '/kitchen/station/GRILL'
        },
        {
            'code': 'FRYER',
            'name_en': 'Fryer & Sides',
            'name_ar': 'قسم الفراير والمقبلات',
            'sla_minutes': 8,
            'display_color': '#ffb4ab',
            'priority_level': 'NORMAL',
            'sort_order': 4,
            'screen_route': '/kitchen/station/FRYER'
        },
        {
            'code': 'BAR',
            'name_en': 'Beverage & Bar',
            'name_ar': 'قسم المشروبات والبار',
            'sla_minutes': 5,
            'display_color': '#4edea3',
            'priority_level': 'NORMAL',
            'sort_order': 5,
            'screen_route': '/kitchen/station/BAR'
        },
        {
            'code': 'DESSERT',
            'name_en': 'Dessert & Pastry',
            'name_ar': 'قسم الحلويات والمعجنات',
            'sla_minutes': 8,
            'display_color': '#ffdadb',
            'priority_level': 'NORMAL',
            'sort_order': 6,
            'screen_route': '/kitchen/station/DESSERT'
        },
        {
            'code': 'ASSEMBLY',
            'name_en': 'Pantry & Expediter Assembly',
            'name_ar': 'قسم التجهيز والتسليم',
            'sla_minutes': 5,
            'display_color': '#6ffbbe',
            'priority_level': 'HIGH',
            'sort_order': 7,
            'screen_route': '/kitchen/station/ASSEMBLY'
        },
    ]

    station_objs = {}
    for stn in stations:
        obj, _ = StationProfile.objects.update_or_create(
            code=stn['code'],
            defaults=stn
        )
        station_objs[stn['code']] = obj
    print(f"  * Seeded {len(stations)} Kitchen Station Profiles")

    # 2. Backup Printer first
    backup_printer, _ = PrinterDevice.objects.update_or_create(
        name='Expediter / Backup Line',
        defaults={
            'display_name': 'Central Kitchen Failover Terminal',
            'printer_type': 'KITCHEN',
            'station': station_objs['ASSEMBLY'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.120',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'is_active': True,
            'auto_print': True,
            'copies': 1,
            'bilingual_mode': True,
            'header_text': "L'ÉTOILE BACKUP PRINT SERVICE",
            'footer_text': 'Emergency Kitchen Failover Active'
        }
    )

    # 3. Main Fleet Printers
    printers_data = [
        {
            'name': 'Hot Line 1 (Grill)',
            'display_name': 'Hot Line 1 - Steaks & Grills',
            'printer_type': 'GRILL',
            'station': station_objs['GRILL'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.110',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Pizza Station P1',
            'display_name': 'Stone Oven Pizza Thermal',
            'printer_type': 'PIZZA',
            'station': station_objs['PIZZA'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.111',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Sandwich Station S1',
            'display_name': 'Gourmet Burger & Panini Prep',
            'printer_type': 'SANDWICH',
            'station': station_objs['SANDWICH'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.112',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Fryer & Apps F1',
            'display_name': 'High Speed Fryer Terminal',
            'printer_type': 'FRYER',
            'station': station_objs['FRYER'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.113',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Bar Dispense P1',
            'display_name': 'Beverage Cellar & Bar Dispense',
            'printer_type': 'BAR',
            'station': station_objs['BAR'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.114',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Dessert & Pastry P1',
            'display_name': 'Patisserie Chef Output',
            'printer_type': 'DESSERT',
            'station': station_objs['DESSERT'],
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.115',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
        {
            'name': 'Cashier Thermal Master',
            'display_name': 'Front Cashier Receipt & Invoicing',
            'printer_type': 'CASHIER',
            'station': None,
            'connection_type': 'USB',
            'ip_address': '192.168.1.101',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': None
        },
        {
            'name': 'Delivery Dispatch Printer',
            'display_name': 'Bag Tagging & Driver Receipt',
            'printer_type': 'DELIVERY',
            'station': None,
            'connection_type': 'NETWORK',
            'ip_address': '192.168.1.105',
            'port': 9100,
            'paper_width': '80MM',
            'status': 'ONLINE',
            'backup_printer': backup_printer
        },
    ]

    printer_objs = {'BACKUP': backup_printer}
    for pdata in printers_data:
        p, _ = PrinterDevice.objects.update_or_create(
            name=pdata['name'],
            defaults=pdata
        )
        printer_objs[pdata['printer_type']] = p
    print(f"  * Seeded {len(printers_data) + 1} Printer Devices")

    # 4. Routing Rules
    rules_data = [
        {
            'name': 'Grill & Steak Station Direct Route',
            'rule_level': 'STATION',
            'station_code': 'GRILL',
            'primary_printer': printer_objs['GRILL'],
            'backup_printer': backup_printer,
            'priority': 10
        },
        {
            'name': 'Pizza Station Direct Route',
            'rule_level': 'STATION',
            'station_code': 'PIZZA',
            'primary_printer': printer_objs['PIZZA'],
            'backup_printer': backup_printer,
            'priority': 10
        },
        {
            'name': 'Sandwich Station Direct Route',
            'rule_level': 'STATION',
            'station_code': 'SANDWICH',
            'primary_printer': printer_objs['SANDWICH'],
            'backup_printer': backup_printer,
            'priority': 10
        },
        {
            'name': 'Fryer & Starters Direct Route',
            'rule_level': 'STATION',
            'station_code': 'FRYER',
            'primary_printer': printer_objs['FRYER'],
            'backup_printer': backup_printer,
            'priority': 10
        },
        {
            'name': 'Bar & Mixology Direct Route',
            'rule_level': 'STATION',
            'station_code': 'BAR',
            'primary_printer': printer_objs['BAR'],
            'backup_printer': backup_printer,
            'priority': 10
        },
        {
            'name': 'Dessert & Pastry Direct Route',
            'rule_level': 'STATION',
            'station_code': 'DESSERT',
            'primary_printer': printer_objs['DESSERT'],
            'backup_printer': backup_printer,
            'priority': 10
        },
    ]

    # Add item specific rule if item exists
    wagyu_item = MenuItem.objects.filter(name__icontains='Wagyu').first()
    if wagyu_item:
        rules_data.append({
            'name': f'Priority Item VIP Route: {wagyu_item.name}',
            'rule_level': 'ITEM',
            'menu_item': wagyu_item,
            'station_code': 'GRILL',
            'primary_printer': printer_objs['GRILL'],
            'backup_printer': backup_printer,
            'priority': 1
        })

    for rdata in rules_data:
        PrinterRoutingRule.objects.update_or_create(
            name=rdata['name'],
            defaults=rdata
        )
    print(f"  * Seeded {len(rules_data)} Printer Routing Rules")

    # 5. Sample Print Jobs
    orders = Order.objects.all()[:3]
    for idx, ord_obj in enumerate(orders):
        p = printer_objs.get('GRILL', backup_printer)
        job_num = f"JOB-105{idx + 20}"
        
        en_content = (
            f"================================\n"
            f"          RESTAURANTOS\n"
            f"          GRILL STATION\n"
            f"================================\n"
            f"ORDER #{ord_obj.order_number}\n"
            f"TABLE {ord_obj.table.table_number if ord_obj.table else 'DELIVERY'}\n"
            f"TYPE: {ord_obj.order_type}\n"
            f"CAPTAIN: {ord_obj.server.name if ord_obj.server else 'Cashier'}\n"
            f"--------------------------------\n"
            f"1 x A5 Miyazaki Wagyu Striploin\n"
            f"DONENESS: MEDIUM RARE\n"
            f"+ SHAVED BLACK TRUFFLE\n"
            f"NOTE: Extra rosemary on side\n"
            f"--------------------------------\n"
            f"PRIORITY: NORMAL\n"
            f"TIME: {timezone.now().strftime('%H:%M')}\n"
            f"================================"
        )

        ar_content = (
            f"================================\n"
            f"          RestaurantOS\n"
            f"          قسم الجريل واللحوم\n"
            f"================================\n"
            f"طلب #{ord_obj.order_number}\n"
            f"الطاولة: {ord_obj.table.table_number if ord_obj.table else 'توصيل'}\n"
            f"النوع: {ord_obj.order_type}\n"
            f"الكابتن: {ord_obj.server.name if ord_obj.server else 'الكاشير'}\n"
            f"--------------------------------\n"
            f"1 × واغيو ميازاكي A5 ستربلوين\n"
            f"الطهي: ميديوم رير (نصف استواء)\n"
            f"+ كمأة سوداء طازجة\n"
            f"ملاحظة: إكليل جبل إضافي جانباً\n"
            f"--------------------------------\n"
            f"الأولوية: عادية\n"
            f"الوقت: {timezone.now().strftime('%H:%M')}\n"
            f"================================"
        )

        KitchenPrintJob.objects.update_or_create(
            job_number=job_num,
            defaults={
                'order': ord_obj,
                'printer': p,
                'station_code': 'GRILL',
                'ticket_type': 'KITCHEN_TICKET',
                'items_payload': [{'name': 'A5 Miyazaki Wagyu Striploin', 'quantity': 1, 'station': 'GRILL'}],
                'rendered_text_en': en_content,
                'rendered_text_ar': ar_content,
                'status': 'PRINTED' if idx > 0 else 'QUEUED',
                'completed_at': timezone.now() if idx > 0 else None
            }
        )
    print("  * Seeded Sample Print Jobs")
    print("[OK] Kitchen Stations & Printer Routing successfully seeded!")

if __name__ == '__main__':
    seed_printer_system()
