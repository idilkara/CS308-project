# CS308-project


Technologies:

    Docker:
        to run containers together: 

            docker-compose up --build 
        
        to stop and remove everything:

            docker-compose down -v

    Database: PostgreSQL

        To build and run the container (cd to the db folder): 

            docker build -t postgres_db .

                docker run --name ecommerce-container \
            -e POSTGRES_USER=admin \
            -e POSTGRES_PASSWORD=adminpassword \
            -e POSTGRES_DB=mydatabase \
            -p 5432:5432 -d postgres_db

            
        command to use the cli from terminal:
        
            docker exec -it postgres_db psql -U admin -d mydatabase

            run any query such as SELECT * FROM users;


    Backend: Python Flask

        To run tests: 

            go into the backend container 
            go to exec 
            run the command : 

            cd tests 
            PYTHONPATH=.. pytest test_products.py

    
    Frontend: ReactJS

        cd react-ui

        docker build -t react-ui .
        docker run -p 3000:3000 react-ui

        access it in browser:  http://localhost:3000

        stop: ctrl+c

        If you need to install dependency inside the docker image: 

            modify package-lock.json and package.json files and build the container again. (ask chatgpt for more info)
        





curl -X POST http://localhost:5001/shopping/add \
    -H "Authorization: Bearer "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY0OTQ0NiwianRpIjoiYThhNDc2ZjctNWUyNS00Nzk5LTlkMWUtM2I0NmY5NDg0YTlmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjciLCJuYmYiOjE3NDE2NDk0NDYsImNzcmYiOiI0YzYyZTVmMS03OTkxLTQxMWItOGJiNy0yMTQ4YWU3YzVjNjYiLCJleHAiOjE3NDE2NTAzNDZ9.RLd_9ioP1xi1hmAJoEh3QkLkaEz6XmBBqOfpayxrp5o" " \
    -H "Content-Type: application/json" \
    -d '{
        "product_id": 2,
        "quantity": 1
    }'


    curl -X POST http://localhost:5001/auth/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser@example.com",
        "password": "testpassword"
    }'


eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY1MDUwOSwianRpIjoiNTFiMjdhMjgtYjY2Yi00ZWI5LWIzM2MtOWVmNTRhYzkzZWQ1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjciLCJuYmYiOjE3NDE2NTA1MDksImNzcmYiOiI2ZTBkNzE1ZS01NjJiLTRlYjktYjFlZS0wMmI0NDZlYmVmMDEiLCJleHAiOjE3NDE2NTE0MDl9.rvTtd4HpIQ0kRXHDlg0cSY8CCOxWy1Op0fj3uI0shSQ


curl -X GET http://localhost:5001/wishlist/view \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY1MDUwOSwianRpIjoiNTFiMjdhMjgtYjY2Yi00ZWI5LWIzM2MtOWVmNTRhYzkzZWQ1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjciLCJuYmYiOjE3NDE2NTA1MDksImNzcmYiOiI2ZTBkNzE1ZS01NjJiLTRlYjktYjFlZS0wMmI0NDZlYmVmMDEiLCJleHAiOjE3NDE2NTE0MDl9.rvTtd4HpIQ0kRXHDlg0cSY8CCOxWy1Op0fj3uI0shSQ"


    curl -X GET http://localhost:5001/shopping/view \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY1MTk3OCwianRpIjoiOGZmZDZjNjAtOGJiOC00OGQ1LWJkNWQtYjQzNWFhMjZhMTk5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjQiLCJuYmYiOjE3NDE2NTE5NzgsImNzcmYiOiIzZjRkMDljNS00YmE0LTQ4MGYtYjZmNy01ZGExOWI4ZThhYjIiLCJleHAiOjE3NDE2NTI4Nzh9.QwD2ZNNx8QOMnkVB4sfdZcCyi9buO0R8ShBKXa3Dko4"

    curl -X POST http://localhost:5001/shopping/add \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY1MTk3OCwianRpIjoiOGZmZDZjNjAtOGJiOC00OGQ1LWJkNWQtYjQzNWFhMjZhMTk5IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjQiLCJuYmYiOjE3NDE2NTE5NzgsImNzcmYiOiIzZjRkMDljNS00YmE0LTQ4MGYtYjZmNy01ZGExOWI4ZThhYjIiLCJleHAiOjE3NDE2NTI4Nzh9.QwD2ZNNx8QOMnkVB4sfdZcCyi9buO0R8ShBKXa3Dko4" \
    -H "Content-Type: application/json" \
    -d '{
        "product_id": 1,
        "quantity": 1
    }'

    curl -X POST http://localhost:5001/shopping/remove \
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTY0OTgwMSwianRpIjoiZTc5MGE0YTQtMjdhZi00MTAzLTkxZWUtZjc3M2ZiZmFjYjVmIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjciLCJuYmYiOjE3NDE2NDk4MDEsImNzcmYiOiI2YzRjZGZjNy1jZTZhLTQyMTYtOGRkZC1kNDNhMmZlZjJmNzYiLCJleHAiOjE3NDE2NTA3MDF9.uiBpiHNM8mZgE9c-uEQaCf1LEUhUyrPELdDpgq94gV4" \
    -H "Content-Type: application/json" \
    -d '{
        "product_id": 1
    }'