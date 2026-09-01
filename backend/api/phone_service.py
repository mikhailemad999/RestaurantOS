import re
from .models import Customer

class PhoneService:
    @staticmethod
    def normalize_phone(raw_phone: str, default_country: str = 'EG') -> str:
        """
        Canonical phone number normalization.
        Supports Egypt (EG), US, and international formats.
        Strips hyphens, parentheses, whitespace, leading zeros.
        Canonical Egyptian: 01012345678, +201012345678, 201012345678 -> +201012345678
        """
        if not raw_phone:
            return ''
        
        # Remove formatting noise
        cleaned = re.sub(r'[\s\-\(\)\.]+', '', str(raw_phone).strip())

        # Egyptian Mobile Pattern: 010, 011, 012, 015 (11 digits)
        if default_country == 'EG' or cleaned.startswith('01') or cleaned.startswith('+20') or cleaned.startswith('20'):
            if cleaned.startswith('+20'):
                return cleaned
            elif cleaned.startswith('20') and len(cleaned) == 12:
                return f"+{cleaned}"
            elif cleaned.startswith('01') and len(cleaned) == 11:
                return f"+20{cleaned[1:]}"
        
        # US / International default formatting
        if cleaned.startswith('+'):
            return cleaned
        elif cleaned.startswith('1') and len(cleaned) == 11:
            return f"+{cleaned}"
        elif len(cleaned) == 10:
            return f"+1{cleaned}"
        
        return f"+{cleaned}" if not cleaned.startswith('+') else cleaned

    @staticmethod
    def check_duplicate_customer(raw_phone: str, name: str = '', exclude_id: int = None):
        """
        Checks if a customer already exists with the normalized phone or similar contact details.
        """
        normalized = PhoneService.normalize_phone(raw_phone)
        qs = Customer.objects.all()
        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        # 1. Exact phone match
        exact = qs.filter(normalized_phone=normalized).first() or qs.filter(phone=raw_phone).first()
        if exact:
            return {
                'is_duplicate': True,
                'match_type': 'EXACT_PHONE',
                'customer': exact,
                'message': f"Customer with phone {raw_phone} already exists ({exact.name})."
            }

        # 2. Secondary phone match
        sec_match = qs.filter(normalized_secondary_phone=normalized).first()
        if sec_match:
            return {
                'is_duplicate': True,
                'match_type': 'SECONDARY_PHONE',
                'customer': sec_match,
                'message': f"Phone {raw_phone} is saved as secondary phone for {sec_match.name}."
            }

        return {
            'is_duplicate': False,
            'customer': None,
            'message': 'No duplicate found.'
        }
