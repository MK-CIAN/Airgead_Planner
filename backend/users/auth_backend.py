from django.contrib.auth import get_user_model
User = get_user_model()

class EmailAuthBackend:
    def authenticate(self, request, email=None, password=None):
        try:
            print(f"Authenticating user with email {email}")
            user = User.objects.get(email=email)
            if user.check_password(password):
                print("User authenticated")
                return user
        except User.DoesNotExist:
            print("User does not exist")
            return None
        
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None