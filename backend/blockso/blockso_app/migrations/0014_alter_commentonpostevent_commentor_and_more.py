# Generated by Django 4.1.1 on 2022-11-04 10:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('blockso_app', '0013_notification_mentionedincommentevent_followedevent_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='commentonpostevent',
            name='commentor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='blockso_app.profile'),
        ),
        migrations.AlterField(
            model_name='followedevent',
            name='followed_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='blockso_app.profile'),
        ),
        migrations.AlterField(
            model_name='mentionedincommentevent',
            name='mentioned_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='blockso_app.profile'),
        ),
        migrations.AlterField(
            model_name='notification',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='blockso_app.profile'),
        ),
    ]
