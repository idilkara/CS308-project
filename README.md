# CS308-project


Technologies:

    Database: PostgreSQL

    To build and run the container (cd to the db folder): 

        docker build -t ecommerce-db .

            docker run --name ecommerce-container \
        -e POSTGRES_USER=admin \
        -e POSTGRES_PASSWORD=admin \
        -e POSTGRES_DB=ecommerce \
        -p 5432:5432 -d ecommerce-db

    
    command to use the cli:
    
        docker exec -it ecommerce-container psql -U admin -d ecommerce

    
    Backend: Python
    
    Frontend: ReactJS
