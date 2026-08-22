
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        groups = list(user.groups.values_list("name", flat=True))

        if user.is_superuser:
            role = "Admin"
        elif groups:
            role = groups[0]
        else:
            role = "User"

        token["role"] = role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        groups = list(self.user.groups.values_list("name", flat=True))

        if self.user.is_superuser:
            role = "Admin"
        elif groups:
            role = groups[0]
        else:
            role = "User"

        data["username"] = self.user.username
        data["role"] = role

        return data