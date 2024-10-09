from rest_framework import serializers
from .models import *

class SupermarketsalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supermarketsales
        fields = '__all__'