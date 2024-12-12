CREATE DATABASE cafenodejs;

create table cafenodejs.user(
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contactNumber varchar(20),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

SELECT * FROM cafenodejs.user;

create table cafenodejs.category(
    id INT primary key NOT NULL AUTO_INCREMENT,
    name varchar(255)
);

ALTER TABLE category MODIFY name VARCHAR(255) NOT NULL;

create table cafenodejs.product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryID integer NOT NULL,
    description varchar(255),
    price int,
    status varchar(20),
    primary key (id)
);

insert into product(name,categoryID,description,price,status) values (?,?,?,?,'true');

select * from cafenodejs.product ;

SELECT 
   p.id, 
   p.name, 
   p.categoryID, 
   p.description, 
   p.price, 
   p.status
FROM product p
INNER JOIN category c 
   ON p.categoryID = c.categoryID;

create table cafenodejs.bill(
    id int NOT NULL AUTO_INCREMENT,
    uuid varchar(200) NOT NULL,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    contactNumber varchar(20) NOT NULL,
    paymentMethod varchar(50) NOT NULL,
    total int NOT NULL,
    productDetails JSON DEFAULT NULL,
    createdBy varchar(255) NOT NULL,
    primary key(id)
);