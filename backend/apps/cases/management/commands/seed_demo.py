from django.core.management.base import BaseCommand
from services.seed_service import seed_demo_data

class Command(BaseCommand):
    help = 'Seeds 8 realistic synthetic Bangladeshi land cases, documents, anomalies, and demo users.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding UNBUmi Detector demo data...'))
        count = seed_demo_data()
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} synthetic land cases with documents, rules, and graphs.'))
