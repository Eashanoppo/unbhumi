from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile, DemoToken
from .serializers import UserSerializer

class DemoLoginView(APIView):
    """
    Demo login endpoint: allows instant sign-in with seeded demo roles
    or demo email credentials without exposing production vulnerabilities.
    """
    permission_classes = []

    def post(self, request):
        role = request.data.get('role')
        email = request.data.get('email')

        # Role to email mapping for demo accounts
        role_map = {
            'demo_reviewer': 'reviewer@unleft.org',
            'demo_supervisor': 'supervisor@unleft.org',
            'demo_admin': 'admin@unleft.org',
        }

        if not role and not email:
            role = 'demo_reviewer'

        if role and role not in role_map and not email:
            return Response(
                {'error': f'অকার্যকর ভূমিকা (Invalid demo role: {role}). অনুমোদিত ভূমিকা: {", ".join(role_map.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        target_email = email or role_map.get(role, 'reviewer@unleft.org')

        # Find or create user
        try:
            user = User.objects.get(email=target_email)
        except User.DoesNotExist:
            username = target_email.split('@')[0]
            user, _ = User.objects.get_or_create(username=username, defaults={'email': target_email})
            user.set_password('demo123')
            user.save()

        # Ensure profile exists
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': role if role in dict(UserProfile.ROLE_CHOICES) else 'demo_reviewer',
                'full_name_bn': 'আব্দুল করিম' if role == 'demo_reviewer' else 'রাশেদ চৌধুরী',
                'organization': 'সাব-রেজিস্ট্রি কার্যালয় (ডেমো)'
            }
        )

        token = DemoToken.generate_token_for_user(user)

        return Response({
            'success': True,
            'message': 'ডেমো লগইন সফল হয়েছে (Demo login successful)',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class DemoLogoutView(APIView):
    def post(self, request):
        if request.auth and isinstance(request.auth, DemoToken):
            request.auth.delete()
        return Response({'success': True, 'message': 'সফলভাবে লগআউট হয়েছে'}, status=status.HTTP_200_OK)


class MeView(APIView):
    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            # Fallback for unauthenticated demo inspection
            reviewer = User.objects.filter(profile__role='demo_reviewer').first()
            if reviewer:
                return Response({
                    'authenticated': False,
                    'suggested_demo_user': UserSerializer(reviewer).data
                })
            return Response({'authenticated': False}, status=status.HTTP_200_OK)

        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
