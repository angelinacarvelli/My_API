Create table if not exists plats (
    id INT PRIMARY KEY,
    nom VARCHAR(255),
    pays varchar(255),
    ingredients JSON,
);