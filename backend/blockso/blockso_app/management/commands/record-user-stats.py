"""
Django command that records stats on the daily, weekly, and monthly
active users relative to the date the command was run.

usage: python manage.py record-user-stats
"""
# std lib imports
import datetime

# third party imports
from dateutil.relativedelta import relativedelta
from django.core.management.base import BaseCommand

# our imports
from blockso_app.models import ActiveUserStats, Profile


class Command(BaseCommand):
    """
    Django command that records stats on the daily, weekly, and monthly
    active users relative to the date the command was run.

    usage: python manage.py record-user-stats
    """

    def handle(self, *args, **options):
        """ Main entrypoint into the django command. """

        # dates to compare
        now = datetime.datetime.now(datetime.timezone.utc)  # now in UTC
        day_delta = now - relativedelta(days=1)
        week_delta = now - relativedelta(weeks=1)
        month_delta = now - relativedelta(months=1)

        # django querysets that filter based on last login time
        daily_count = Profile.objects.filter(
            user__last_login__gte=day_delta
        ).count()

        weekly_count = Profile.objects.filter(
            user__last_login__gte=week_delta
        ).count()

        monthly_count = Profile.objects.filter(
            user__last_login__gte=month_delta
        ).count()

        # store a record of the statistics
        record = ActiveUserStats.objects.create(
            day_to_date_count=daily_count,
            week_to_date_count=weekly_count,
            month_to_date_count=monthly_count
        )

        # print the results
        print("Active Users, daily: ", record.day_to_date_count)
        print("Active Users, weekly: ", record.week_to_date_count)
        print("Active Users, monthly: ", record.month_to_date_count)
