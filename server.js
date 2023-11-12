require('dotenv').config();
var express = require('express');
var app = express();
const path = require('path');
const http = require('http');
const sqlite3=require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
  }));
app.get('/', function(req, res) {
    res.render('inicio');
});
app.get('/login', (req, res) => {
  if (req.session.admin == true) {
    res.redirect("/administrador");
  } else {
    res.render('login');
  }
       
  });
  app.post('/login', (req, res) => {
  const {usuario, contraseña } = req.body;
  const username = process.env.user;
  const contra = process.env.PASSWORD;
  if (usuario == username && contraseña == contra) {
    req.session.admin = true;
    res.redirect('/administrador');
  } else {
    res.render('login')
  }
});
app.get('/cerrarsesion', (req, res) => {
    req.session.destroy();
      res.redirect('/login');
   });
    app.get('/administrador', (req, res) => {
    if (req.session.admin) {
      const sqlProd = "SELECT * FROM Productos ORDER BY id";
      const sqlCat = "SELECT * FROM Categorias ORDER BY id";
      const sqlIma = "SELECT * FROM Imagenes ORDER BY id";
      
      db.all(sqlProd, [], (errProductos, rowsProductos) => {
        if (errProductos) {
          return console.error(errProductos.message);
        } else {
          db.all(sqlCat, [], (errCategorias, rowsCategorias) => {
            if (errCategorias) {
              return console.error(errCategorias.message);
            } else {
              db.all(sqlIma, [], (errImagenes, rowsImagenes) => {
                if (errImagenes) {
                  return console.error(errImagenes.message);
                } else {
                  res.render("admin", { Productos: rowsProductos, Categorias: rowsCategorias, Imagenes: rowsImagenes });
                }
              });
            }
          });
        }
      });
    } else {
      res.redirect('/login');
    }
  });
  app.get('/administrador/categorias', (req, res) => {
    if (req.session.admin == true) {
        const sql="SELECT * FROM Categorias ORDER BY ID";
        db.all(sql,[], (err, rows)=>{
            if (err){
                return console.error(err.message);
            }else{
                res.render("Categorias.ejs",{Categorias:rows});
            }
        })
    } else {
      res.redirect('/login');
    }
  });
  app.get('/administrador/categorias/crear', (req, res) => {
    if (req.session.admin == true) {
      res.render('Agg.Categorias.ejs', {Categorias:{}});
    } else {
      res.redirect('/login');
    }
   });
   app.post('/administrador/categorias/crear', (req, res) => {
    if (req.session.admin == true) {
      const sql="INSERT INTO Categorias (Nombre) VALUES (?)";
  const newcat = [req.body.Nombre];
  db.run(sql, newcat, err => {
  if(err) {
    return console.error(err.message);
  }else {
    res.redirect('/administrador/categorias');
  }
  })
    } else {
      res.redirect('login');
    }  
  });
  app.get('/administrador/categorias/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="SELECT * FROM Categorias where ID=?";
    db.get(sql, id, (err, rows)=>{
      res.render('Editar.Categorias.ejs', {Categorias:rows});
    })
    } else {
     res.redirect('/login'); 
    }
   });
   app.post('/administrador/categorias/editar/:id', (req, res) => {
  if (req.session.admin == true) {
    const id=req.params.id;
    const newcat = [req.body.Nombre, id];
    const sql = "UPDATE Categorias SET Nombre=? WHERE (ID=?)";
    db.run(sql, newcat, err => {
     if(err) {
       return console.error(err.message);
     }else {
       res.redirect('/administrador/categorias');
     }
     })
  } else {
    res.redirect('login');
  }
   });
   app.get('/administrador/categorias/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id =req.params.id;
      const sql="SELECT * FROM Categorias WHERE ID=?";
      db.get(sql,id,(err,rows)=>{
        res.render('Eliminar.Categorias.ejs', {Categorias:rows});
      })
    } else {
      res.redirect('/login');
    }
   });
   app.post('/administrador/categorias/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="DELETE FROM Categorias where ID=?";
    db.run(sql, id, err => {
      if (err) {
        return console.error(err.message);
      } else {
        res.redirect("/administrador/categorias");
      }
    })
    } else {
     res.redirect('/login'); 
    }
   });
   app.get('/administrador/productos', (req, res) => {
    if (req.session.admin == true) {
        const sql="SELECT * FROM Productos ORDER BY ID";
        db.all(sql,[], (err, rows)=>{
            if (err){
                return console.error(err.message);
            }else{
                res.render("Productos.ejs",{Productos:rows});
            }
        })
    } else {
      res.redirect('/login');
    }
  });
   app.get('/administrador/productos/crear', (req, res) => {
    if (req.session.admin == true) {
      res.render('Agg.Productos.ejs', {Productos:{}});
    } else {
      res.redirect('/login');
    }
   });
   app.post('/administrador/productos/crear', (req, res) => {
    if (req.session.admin == true) {
      const sql="INSERT INTO Productos (Nombre ,Codigo,Descripcion,Color,Dimensiones,Precio,Categoria_ID) VALUES (?,?,?,?,?,?,?)";
  const newpro = [req.body.Nombre, req.body.Codigo, req.body.Descripcion, req.body.Color, req.body.Dimensiones, req.body.Precio, req.body.Categoria_ID];
  db.run(sql, newpro, err => {
  if(err) {
    return console.error(err.message);
  }else {
    res.redirect('/administrador/productos');
  }
  })
    } else {
      res.redirect('login');
    }  
  });
  app.get('/administrador/productos/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id =req.params.id;
      const sql="SELECT * FROM Productos WHERE ID=?";
      db.get(sql,id,(err,rows)=>{
        res.render('Eliminar.Productos.ejs', {Productos:rows});
      })
    } else {
      res.redirect('/login');
    }
   });
 
  app.post('/administrador/productos/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="DELETE FROM Productos where id=?";
    db.run(sql, id, err => {
      if (err) {
        return console.error(err.message);
      } else {
        res.redirect("/administrador/productos");
      }
    })
    } else {
     res.redirect('/login'); 
    }
   });

   app.get('/administrador/productos/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="SELECT * FROM Productos where id=?";
    db.get(sql, id, (err, rows)=>{
        res.render('Editar.Productos.ejs', {Productos:rows});
     
    })
    } else {
     res.redirect('/login'); 
    }
   });
   app.post('/administrador/productos/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
      const prod =  [req.body.Nombre, req.body.Codigo, req.body.Descripcion, req.body.Color, req.body.Dimensiones, req.body.Precio, req.body.Categoria_ID, id];
      const sql = "UPDATE Productos SET Nombre=?, Codigo=?, Descripcion=?, Color=?, Dimensiones=?, Precio=?, Categoria_ID=? WHERE (id=?)";
      db.run(sql, prod, err => {
       if(err) {
         return console.error(err.message);
       }else {
         res.redirect('/administrador/productos');
       }
       })
    } else {
      res.redirect('/login'); 
    }
   
   });
   app.get('/administrador/imagenes', (req, res) => {
    if (req.session.admin == true) {
        const sql="SELECT * FROM Imagenes ORDER BY ID";
        db.all(sql,[], (err, rows)=>{
            if (err){
                return console.error(err.message);
            }else{
                res.render("Imagenes.ejs",{Imagenes:rows});
            }
        })
    } else {
      res.redirect('/login');
    }
  });
  app.get('/administrador/imagenes/crear', (req, res) => {
    if (req.session.admin == true) {
      res.render('Agg.Imagenes.ejs', {Imagenes:{}});
    } else {
      res.redirect('/login');
    }
   });
   app.post('/administrador/imagenes/crear', (req, res) => {
    if (req.session.admin == true) {
      const sql="INSERT INTO Imagenes (URL,Destacado,Producto_ID) VALUES (?,?,?)";
  const newima = [req.body.URL, req.body.Destacado, req.body.Producto_ID];
  db.run(sql, newima, err => {
  if(err) {
    return console.error(err.message);
  }else {
    res.redirect('/administrador/imagenes');
  }
  })
    } else {
      res.redirect('login');
    }  
  });
  app.get('/administrador/imagenes/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id =req.params.id;
      const sql="SELECT * FROM Imagenes WHERE ID=?";
      db.get(sql,id,(err,rows)=>{
        res.render('Eliminar.Imagenes.ejs', {Imagenes:rows});
      })
    } else {
      res.redirect('/login');
    }
   });
 
  app.post('/administrador/imagenes/eliminar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="DELETE FROM Imagenes where id=?";
    db.run(sql, id, err => {
      if (err) {
        return console.error(err.message);
      } else {
        res.redirect("/administrador/imagenes");
      }
    })
    } else {
     res.redirect('/login'); 
    }
   });

   app.get('/administrador/imagenes/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
    const sql="SELECT * FROM Imagenes where id=?";
    db.get(sql, id, (err, rows)=>{
        res.render('Editar.Imagenes.ejs', {Imagenes:rows});
     
    })
    } else {
     res.redirect('/login'); 
    }
   });
   app.post('/administrador/imagenes/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
      const prod =  [req.body.URL, req.body.Destacado, req.body.Producto_ID, id];
      const sql = "UPDATE Imagenes SET URL=?, Destacado=?, Producto_ID=? WHERE (id=?)";
      db.run(sql, prod, err => {
       if(err) {
         return console.error(err.message);
       }else {
         res.redirect('/administrador/imagenes');
       }
       })
    } else {
      res.redirect('/login'); 
    }
   
   });
   app.get('/logout', (req, res) => {
    req.session.destroy();
      res.redirect('/login');
   });







   app.get('/*', function(req, res) {
    res.render('inicio');
  });


app.listen(8000);
console.log('8000 is the magic port');

//Conectando base de datos

const db_TurboClean=path.join(__dirname,"db", "base.db");
const db=new sqlite3.Database(db_TurboClean, err =>{
    if (err){
        return console.error(err.message);
    }else{
        console.log("Conexion exitosa con la base de datos");
    }
})

//Crear Tabla Categoria

const sql_ctg = `CREATE TABLE IF NOT EXISTS Categorias(ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT)`

db.run(sql_ctg, err => {
    if (err) {
        console.error(err.message);
    }else{
        console.log("Tabla Categoria Creada");
    }
});



//Crear Tabla Productos
const sql_prdt = `CREATE TABLE IF NOT EXISTS Productos(ID INTEGER PRIMARY KEY AUTOINCREMENT,Nombre TEXT,Codigo TEXT,Descripcion TEXT,
  Color TEXT,Dimensiones TEXT ,Precio REAL,Categoria_ID INTEGER,FOREIGN KEY(Categoria_ID) REFERENCES Categorias(ID))`
  
  db.run(sql_prdt, err => {
      if (err) {
          console.error(err.message);
      }else{
          console.log("Tabla Productos Creada");
      }
  });
  
  //Crear Tabla Imagenes
  const sql_img = `CREATE TABLE IF NOT EXISTS Imagenes (ID INTEGER PRIMARY KEY AUTOINCREMENT,URL TEXT,Destacado text,
  Producto_ID INTEGER, FOREIGN KEY(Producto_ID) REFERENCES Productos(ID))`
  
  db.run(sql_img, err => {
      if (err) {
          console.error(err.message);
      }else{
          console.log("Tabla Imagenes Creada");
      }
  });
  

 