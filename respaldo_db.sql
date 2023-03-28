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
	id_categoria INT NOT NULL,
	id_usuario INT NOT NULL,
	FOREIGN KEY(id_categoria) REFERENCES categorias(id),
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
);

ALTER TABLE publicaciones ADD COLUMN imagen VARCHAR(255);

CREATE TABLE comentarios(
	id serial primary key,
	contenido VARCHAR(1000) NOT NULL,
	id_usuario INT NOT NULL,
	id_publicacion INT NOT NULL,
	FOREIGN KEY(id_usuario) REFERENCES usuarios(id),
	FOREIGN KEY(id_publicacion) REFERENCES publicaciones(id)
);

INSERT INTO categorias(nombre) VALUES('Clásico'), ('Moderno');
UPDATE publicaciones SET imagen = 'imagen.jpg'

INSERT INTO usuarios(nombre, email, password) VALUES('carlos', 'carlos@gmail.com', '123456'), ('pepito', 'pepito@gmail.com', '123456');

INSERT INTO publicaciones(titulo, contenido,fecha,id_categoria, id_usuario) VALUES
('Película titulo 1', 'Contenido película 1', now(), 1, 1),
('Película titulo 2', 'Contenido película 2', now(), 2, 2);

select * from categorias;