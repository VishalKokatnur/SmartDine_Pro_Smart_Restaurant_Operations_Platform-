
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_role(request):
    user = request.user

    groups = list(user.groups.values_list("name", flat=True))

    role = groups[0] if groups else "User"

    return Response({
        "username": user.username,
        "role": role,
    })