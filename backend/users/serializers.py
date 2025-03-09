from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True},  # Do not expose the password in responses
            'username': {'required': True},   # Ensure username is mandatory
        }

    def validate_username(self, value):
        """
        Ensure the username is unique.
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        """
        Create a new user with the given data.
        """
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        """
        Authenticate user with email and password.
        """
        email = data.get('email')
        password = data.get('password')

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid login credentials")
        return data
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'tooltips_enabled']
