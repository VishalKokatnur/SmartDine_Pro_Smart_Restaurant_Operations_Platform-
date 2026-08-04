from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        groups = list(user.groups.values_list("name", flat=True))

        token["role"] = groups[0] if groups else "User"

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        groups = list(self.user.groups.values_list("name", flat=True))

        data["username"] = self.user.username
        data["role"] = groups[0] if groups else "User"

        return data