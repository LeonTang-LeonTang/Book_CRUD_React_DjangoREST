
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Book
from .serializer import BookSerializer

#React JS object
#    ↓ JSON.stringify
# JSON string
#    ↓ HTTP
# JSON string
#    ↓ DRF JSONParser
# Python dict            ← request.data
#    ↓ Serializer
# Python dict            ← serializer.data
#    ↓ Response() + JSONRenderer
# JSON string
#    ↓ HTTP
# JSON string
#    ↓ response.json()
# JS object

# Serializer does NOT return JSON strings.
# Response() does the JSON rendering.
@api_view(['GET'])

def get_books (request):
    """
    GET summary(data flow)
    DB rows
    ↓
    Book model instances
    ↓
    Serializer
    ↓
    Python list of dicts
    ↓
    Response()
    ↓
    JSON sent to client
    """
    books = Book.objects.all() #data type: books → QuerySet,These are Django model instances, NOT JSON
    serializedData =BookSerializer(books, many=True).data #take a list of  Django model instances, NOT JSON. Serializer role here: Model objects → Python primitive types and .data role: returns Python list of dict (NOT a JSON string)
    """
    serializedData
        [
    {'id': 1, 'title': 'A', 'author': 'X'},
    {'id': 2, 'title': 'B', 'author': 'Y'}
    ]
    """
    """
    What Response() does
	•	Input: Python list / dict
	•	Output: HTTP response with JSON body
    """
    return Response(serializedData) # response make python dict -> HTTP response with json body

@api_view(['POST'])
def create_books (request):
    # Client JSON
    # ↓
    # request.data (Python dict)
    # ↓
    # Serializer (validation)
    # ↓
    # Model instance saved
    # ↓
    # serializer.data (Python dict)
    # ↓
    # Response() → JSON
   data = request.data #request.data → Python dict
   serializer =BookSerializer(data=data) #Python dict → model instance
   if serializer.is_valid():
       serializer.save()
       #Response converts model instance → JSON
       return Response(serializer.data, status=status.HTTP_201_CREATED)
   return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE']) #pk means primary key
def book_detail (request,pk):
    try:
        book =Book.objects.get(pk=pk)
    except Book.DoesNotExit:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method =="PUT":
        #PUT summary (data flow)
            # Client JSON
            # ↓
            # request.data (dict)
            # ↓
            # Serializer(book + data)
            # ↓
            # Updated Book instance
            # ↓
            # serializer.data (dict)
            # ↓
            # Response() → JSON
        data= request.data #✅ request.data is an object (Python dict) ❌ not a JSON string
        serializer = BookSerializer(book, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) #	serializer.data → updated book as Python dict; Response → JSON
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    