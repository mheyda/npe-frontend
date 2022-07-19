from django.shortcuts import render
import requests
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import filters, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer
from .models import CustomUser, Favorite
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


# Render home page
def index(request):
    return render(request, "index.html")


# 404 Error Page
def handler404(request, exception):
    return render(request, '404.html', status=404)


# 500 Error Page
def handler500(request, exception):
    return render(request, '500.html', status=500)


# Get weather data
@api_view(['GET'])
def getWeather(request):
    lng = request.query_params.get('lng')
    lat = request.query_params.get('lat')
    weather = requests.get(f'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lng}&exclude=&appid={settings.OPEN_WEATHER_API_KEY}').json()
    return Response(weather)


# Get park data
@api_view(['GET'])
def getParks(request):
    start = request.query_params.get('start')
    limit = request.query_params.get('limit')
    sort = request.query_params.get('sort')
    stateCode = request.query_params.get('stateCode')
    parks = requests.get(f'https://developer.nps.gov/api/v1/parks?start={start}&limit={limit}&sort={sort}&stateCode={stateCode}&api_key={settings.NPS_API_KEY}').json()
    return Response(parks)


# Get user information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    try:
        user_info = {
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "birthdate": request.user.birthdate,
        }
        return Response(user_info, status=status.HTTP_200_OK)

    except:
        return Response(status=status)


# API view for user to get and post requests for their favorite parks
@api_view(['GET', 'POST'])
#@permission_classes([IsAuthenticated])
def favorites(request):
    print(request.method)
    
    if request.method == 'GET':
        try:
            # Find user's favorites and return them
            user = CustomUser.objects.get(username = request.user)
            favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)
            return Response(favorites_list, status=status.HTTP_200_OK)

        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        try:
            # Get the id of the park the user wants to add or remove, get user object, and get user's favorites
            park_id = request.data.get("park_id")
            user = CustomUser.objects.get(username = 'marshallheyda')#request.user)
            favorites_list = Favorite.objects.filter(user = user).values_list('park_id', flat=True)

            # If the user already has the park in their favorites, remove it
            for favorite in favorites_list:
                if favorite == park_id:
                    Favorite.objects.filter(user = user, park_id = park_id).delete()
                    return Response(favorites_list, status=status.HTTP_200_OK)
            
            # Otherwise add to user's favorites
            Favorite.objects.create(user = user, park_id = park_id)
            return Response(park_id, status=status.HTTP_200_OK)

        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class ObtainTokenPairWithClaims(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class CustomUserCreate(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format='json'):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)