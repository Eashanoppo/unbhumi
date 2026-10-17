from rest_framework import authentication, exceptions
from .models import DemoToken

class DemoTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() not in ('token', 'bearer'):
            return None

        token_key = parts[1]
        try:
            token = DemoToken.objects.select_related('user', 'user__profile').get(key=token_key)
            return (token.user, token)
        except DemoToken.DoesNotExist:
            # Stale, expired, or purged demo token: return None so unauthenticated/AllowAny views succeed.
            return None
