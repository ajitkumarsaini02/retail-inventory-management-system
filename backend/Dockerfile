# Stage 1: Build Spring Boot JAR with Maven and Java 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production JAR without tests
RUN mvn clean package -DskipTests

# Stage 2: Lightweight JRE 17 Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=build /app/target/retail_inventory-0.0.1-SNAPSHOT.jar app.jar

# Expose port and run
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
