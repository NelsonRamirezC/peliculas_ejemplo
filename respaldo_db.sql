CREATE TABLE usuarios(
	id serial primary key,
	nombre VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(150) NOT NULL
);

CREATE TABLE categorias(
	id serial primary key,
	nombre VARCHAR(50) NOT NULL
);

CREATE TABLE publicaciones(
	id serial primary key,
	titulo VARCHAR(255) NOT NULL,
	contenido VARCHAR(1000) NOT NULL,
	fecha date NOT NULL,
    imagen VARCHAR(255) NOT NULL,
	id_categoria INT NOT NULL,
	id_usuario INT NOT NULL,
	FOREIGN KEY(id_categoria) REFERENCES categorias(id),
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE comentarios(
	id serial primary key,
	contenido VARCHAR(1000) NOT NULL,
	id_usuario INT NOT NULL,
	id_publicacion INT NOT NULL,
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id),
	FOREIGN KEY(id_publicacion) REFERENCES publicaciones(id)
);


--INSERTS DE PRUEBA
--categorias
INSERT INTO categorias(nombre) VALUES('Clásico'), ('Moderno');

--usuarios
INSERT INTO categorias(nombre) VALUES('Clásico'), ('Moderno');

--películas
INSERT INTO publicaciones(titulo, contenido,fecha,id_categoria, id_usuario) VALUES
('Película titulo 1', 'Contenido película 1', now(), 1, 1);