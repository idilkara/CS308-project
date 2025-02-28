# Use the official PostgreSQL image
FROM postgres:latest


# Copy the SQL schema into the Docker container
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
