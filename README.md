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

        
    Backend: Python Flask
    
    Frontend: ReactJS

        cd react-ui

        docker build -t react-ui .
        docker run -p 3000:3000 react-ui

        access it in browser:  http://localhost:3000

        stop: ctrl+c

        If you need to install dependency inside the docker image: 

            modify package-lock.json and package.json files and build the container again. (ask chatgpt for more info)
        



