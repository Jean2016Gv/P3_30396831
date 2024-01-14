require('dotenv').config();
var express = require('express');
var app = express();
const path = require('path');
const http = require('http');
const sqlite3=require('sqlite3').verbose();
const session = require('express-session');
const bodyParser = require('body-parser');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha('6Le6p0spAAAAAKDIQVrcTlvwmMy2PM4i6oWhKP1-', '6Le6p0spAAAAAG4WmCFqc51ucRpcPtuHaJeZfeGC');
const axios = require('axios');
app.use(recaptcha.middleware.verify);
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.json());
app.set('trust proxy', true);

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
  }));
  app.get('/', function(req, res) {
    let sql = 'SELECT Productos.ID, Productos.Nombre, Productos.precio, Productos.Codigo, Productos.Descripcion, Productos.Marca, Productos.Color, Categorias.Nombre AS CategoriaNombre, Imagenes.URL, Imagenes.Destacado FROM Productos INNER JOIN Categorias ON Productos.Categoria_ID = Categorias.ID INNER JOIN Imagenes ON Productos.ID = imagenes.producto_id where 1=1';

    db.all(sql, [], (errProductos, rowsProductos) => {
      if (errProductos) {
        return console.error(errProductos.message);
      } else {
               if (req.session.user || req.session.admin) {
                res.render("inicio", { Productos: rowsProductos, url: '/cerrarsesion' });
               } else {
                res.render("inicio", { Productos: rowsProductos, url: '/registro.Clientes' });
               }
              }
    })
  });
app.get('/registro.Clientes', recaptcha.middleware.render, (req, res)  =>{
  if (req.session.admin) {
    res.redirect('/administrador')
  } else {
    if (req.session.user == true) {
   res.redirect('/')
  } else {
    res.render('registro.Clientes.ejs' , { captcha: res.recaptcha })
  }
  }

  

});
app.post('/registro.Clientes' , (req, res) =>{
  const { Nombre, Correo, Contraseña} = req.body;
  const sql= "SELECT correo FROM Registro WHERE correo = ?" ;
  recaptcha.verify(req, (error, recaptchadatos) => { 
    if (error) {
      console.error(error);
      return res.status(500).send('Error en el servidor');
    } else {
      db.get(sql, [Correo], (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error en el servidor');
        }
        
        if (row) {
          return res.redirect('/registro.Clientes');
        }
    
        const sqlCliente = "INSERT INTO Registro (Nombre, Correo, Contraseña) VALUES (?, ?, ?)";
        db.run(sqlCliente, [Nombre, Correo, Contraseña], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error en el servidor');
          } else {
            req.session.user = true;
            req.session.username = Correo;
            req.session.admin = false;
            return res.redirect('/');
          }
        });
      });
    }

  });
});


app.get('/inicioSesionClientes', (req,res) =>{
  if (req.session.admin == true ){
    res.redirect('/administrador')

  }else{
    if (req.session.user == true){
      res.redirect ('/')
    }else{
      res.render('inicioSesionClientes')
    }
  }
 });



app.post('/inicioSesionClientes', (req, res) => {
  const { correo, contraseña } = req.body;

    const sql ='SELECT * FROM Registro WHERE Correo = ? AND Contraseña = ?';
  db.get(sql, [correo, contraseña], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error en el servidor');
    }

    if (row) {
      req.session.username = correo;
      req.session.user = true;
      req.session.admin = false;
      res.redirect('/');
    } else {
      res.redirect('/inicioSesionClientes');
    }
  });
});



app.get('/login', (req, res) => {
  if (req.session.admin == true) {
    res.redirect("/administrador");
  } else {
    if (req.session.user == true){
      res.redirect ('/')

    }else{
      res.render('login');
    }
  }
       
  });
  app.post('/login', (req, res) => {
  const {usuario, contraseña } = req.body;
  const username = process.env.user;
  const contra = process.env.PASSWORD;
  if (usuario == username && contraseña == contra) {
    req.session.admin = true;
    req.session.user = false;
    res.redirect('/administrador');
  } else {
    res.render('login')
  }
});
app.get('/cerrarsesion', (req, res) => {
    req.session.destroy();
      res.redirect('/');
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
      const sqlCategorias = "SELECT * FROM Categorias ORDER BY ID";
      
      db.all(sqlCategorias, (err, Categorias) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al obtener las categorías.");
        } else {
          res.render('Agg.Productos.ejs', { Categorias, Productos: {} });
        }
      });
    } else {
      res.redirect('/login');
    }
  });
   app.post('/administrador/productos/crear', (req, res) => {
    if (req.session.admin == true) {
      const sql="INSERT INTO Productos (Nombre ,Codigo,Descripcion,Color,Marca,Precio,Categoria_ID) VALUES (?,?,?,?,?,?,?)";
  const newpro = [req.body.Nombre, req.body.Codigo, req.body.Descripcion, req.body.Color, req.body.Marca, req.body.Precio, req.body.Categoria_ID];
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
      const id = req.params.id;
      const sql = "SELECT * FROM Productos WHERE id=?";
      const sqlCat = "SELECT * FROM categorias";
      
      db.get(sql, id, (err, rows) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al obtener el producto.");
        } else {
          db.all(sqlCat, (err, Categorias) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error al obtener las categorías.");
            } else {
              res.render('Editar.Productos.ejs', { Productos: rows, Categorias });
            }
          });
        }
      });
    } else {
      res.redirect('/login');
    }
  });
   app.post('/administrador/productos/editar/:id', (req, res) => {
    if (req.session.admin == true) {
      const id=req.params.id;
      const prod =  [req.body.Nombre, req.body.Codigo, req.body.Descripcion, req.body.Color, req.body.Marca, req.body.Precio, req.body.Categoria_ID, id];
      const sql = "UPDATE Productos SET Nombre=?, Codigo=?, Descripcion=?, Color=?, Marca=?, Precio=?, Categoria_ID=? WHERE (id=?)";
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
      const sql = "SELECT * FROM productos";
      db.all(sql, (err, Productos) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al obtener los productos.");
        } else {
          res.render('Agg.Imagenes.ejs', { Productos, Imagenes: {} });
        }
      });
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
      const id = req.params.id;
      const sql = "SELECT * FROM Imagenes WHERE id=?";
      const sqlProd = "SELECT * FROM productos";
      
      db.get(sql, id, (err, rows) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error al obtener la imagen.");
        } else {
          db.all(sqlProd, (err, Productos) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error al obtener los productos.");
            } else {
              res.render('Editar.Imagenes.ejs', { Imagenes: rows, Productos });
            }
          });
        }
      });
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
   app.get('/carrito', function(req, res) {
    res.render('carrito');
});

app.post('/buscar', (req, res) => {
  const { Nombre, Categoria, Descripcion, Marca, Color } = req.body;
  let sql = 'SELECT Productos.ID, Productos.Nombre, Productos.precio, Productos.Codigo, Productos.Descripcion, Productos.Marca, Productos.Color, Categorias.Nombre AS CategoriaNombre, Imagenes.URL, Imagenes.Destacado FROM Productos INNER JOIN Categorias ON Productos.Categoria_ID = Categorias.ID INNER JOIN Imagenes ON Productos.ID = imagenes.producto_id where 1=1';

  const params = [];
  if (Nombre) {
    sql += " AND Productos.Nombre LIKE '%' || ? || '%'";
    params.push(Nombre);
  }

  if (Categoria) {
    sql += " AND CategoriaNombre= ?";
    params.push(Categoria);
  }

  if (Descripcion) {
    sql += " AND Productos.Descripcion LIKE '%' || ? || '%'";
    params.push(Descripcion);
  }

  if (Marca) {
    sql += " AND Productos.Marca LIKE '%' || ? || '%'";
    params.push(Marca);
  }

  if (Color) {
    sql += " AND Productos.Color LIKE '%' || ? || '%'";
    params.push(Color);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return console.error(err.message);
            } else {
              if (req.session.user || req.session.admin) {
                res.render("inicio", { Productos: rows, url: '/cerrarsesion' });
               } else {
                res.render("inicio", { Productos: rows, url: '/registro.Clientes' });
               } 
            }
  });
});
app.get('/producto/:id', (req, res) => {
  const ID = req.params.id;
  const sqlProd = "SELECT * FROM Productos WHERE ID = ?";
  const sqlIma = "SELECT * FROM Imagenes WHERE Producto_ID = ?";
  const sqlCat = "SELECT * FROM Categorias WHERE ID IN (SELECT Categoria_ID FROM Productos WHERE ID = ?)";
  
  db.get(sqlProd, ID, (err, Productos) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (!Productos) {
      res.status(404).send("Producto no encontrado.");
      return;
    }

    db.get(sqlIma, ID, (err, Imagenes) => {
      if (err) {
        console.error(err);
        return;
      }

      db.get(sqlCat, ID, (err, Categorias) => {
        if (err) {
          console.error(err);
          return;
        }

        res.render('producto.perfil.ejs', { Productos, Imagenes, Categorias, ID });
      });
    });
  });
});

//direccion payment para el formulario

app.get('/pago/:id', (req, res) => {
  const id = req.params.id;
  const username = req.session.username;
  if (!req.session.user) {
    res.redirect('/registro.Clientes');
  } else if (req.session.admin) {
    res.redirect('/administrador');
  } else {
    const sqlProd = "SELECT * FROM productos WHERE id = ?";
    const sqlIma = "SELECT * FROM imagenes WHERE producto_id = ?"
    const sqlReg = "SELECT * FROM Registro WHERE correo = ?"
    db.get(sqlProd, id, (err, rowsProductos) => {
      if (err) {
        console.error(err);
        return;
      }
      
      if (!rowsProductos) {
        res.status(404).send("Producto no encontrado.");
        return;
      }
  
      db.get(sqlIma, id, (err, rowsImagenes) => {
        if (err) {
          console.error(err);
          return;
        }
        db.get(sqlReg, username, (err, rowsRegistro) => {
          if (err) {
            console.error(err);
            return;
          }
          res.render('pago', { productos: rowsProductos, clientes: rowsRegistro, imagenes: rowsImagenes, id, username });
        });
      });
    });
  }  
});

app.post('/payments', async (req, res) => {
  const ip_cliente = req.ip;
  const {
    cvv,
    'expiration-month': expirationMonth,
    'expiration-year': expirationYear,
    name: fullName,
    "card-number": tarjeta,
    precio,
    id: idProducto,
    idCliente: idCliente,
    cantidad
  } = req.body;
  const precioProducto = (precio * cantidad).toFixed(2);
  const payment = {
    amount: precioProducto,
    'card-number': tarjeta,
    cvv,
    'expiration-month': expirationMonth,
    'expiration-year': expirationYear,
    'full-name': fullName,
    currency: 'USD',
    description: idProducto,
    reference: idCliente
  };

  try {
    const response = await axios.post('https://fakepayment.onrender.com/payments', payment, {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0xM1QyMTo1MTowMy42NjhaIiwiaWF0IjoxNzA1MTgyNjYzfQ.axESJcjQ06PKq3gQEUJhkuDNNztHGNnLAdnxzoyEfrA'
      }
    });
    const datos = JSON.parse(JSON.stringify(response.data));
    const transactionId = datos.data.transaction_id;
    const amount = datos.data.amount;
    const date = datos.data.date;
    const reference = datos.data.reference;
    const description = datos.data.description;
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO Compra (Transaccion_ID, Cantidad, Total_Pagado, Fecha, IP_Cliente, Cliente_ID, Producto_ID) VALUES(?,?,?,?,?,?,?)",
        [transactionId, cantidad, amount, date, ip_cliente, reference, description],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
    req.session.datos = datos;
    res.redirect("/transaccion");
  } catch (error) {
    res.render('transaccion', { error, datos : null, idProducto });
  }
});
app.get('/transaccion', (req, res) => {
  if (!req.session.user) {
    res.redirect("/");
  } else if (req.session.admin) {
    res.redirect("/administrador");
  } else {
    const datos = req.session.datos;

    res.render('transaccion', { datos, error: null });
  
    delete req.session.datos;
  }
});
app.get('/administrador/clientes', (req, res) => {
  if (!req.session.admin) {
    res.redirect("/login");
  } else {
    const sql = 'SELECT * FROM Registro'
    db.all(sql, [], (err, registro) => {
      if (err) {
        return console.error(err.message);
      } else {
        res.render("adminRegistro", { registro });
      }
    });
  }
});
app.get('/administrador/transacciones', (req, res) => {
  if (!req.session.admin) {
    res.redirect("/login");
  } else {
    const sqlCompra = 'SELECT * FROM compra';

    db.all(sqlCompra, [], (err, compra) => {
      if (err) {
        return console.error(err.message);
    
              } else {
                res.render("adminTransaccion", { compra });
      }
    });
  }
});

   app.get('/*', function(req, res) {
    res.redirect('/');
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
  Color TEXT,Marca TEXT ,Precio REAL,Categoria_ID INTEGER,FOREIGN KEY(Categoria_ID) REFERENCES Categorias(ID))`
  
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

  //Crear Tabla Registro
  const sql_reg = `CREATE TABLE IF NOT EXISTS Registro (ID INTEGER PRIMARY KEY AUTOINCREMENT, Nombre TEXT,Correo TEXT,Contraseña TEXT)`
    
    db.run(sql_reg, err => {
        if (err) {
            console.error(err.message);
        }else{
            console.log("Tabla Registro Creada");
        }
    });

  //Crear Tabla Compra
  const sql_cmp = `CREATE TABLE IF NOT EXISTS Compra ( Transaccion_ID TEXT PRIMARY KEY, Cantidad INTEGER, Total_Pagado FLOAT,
   Fecha datetime, IP_Cliente TEXT, Cliente_ID TEXT, Producto_ID TEXT, FOREIGN KEY(Cliente_ID) REFERENCES Compra(ID), 
   FOREIGN KEY(Producto_ID) REFERENCES Productos(ID) )`

   db.run(sql_cmp, err => {
    if (err) {
        console.error(err.message);
    }else{
        console.log("Tabla Compra Creada");
    }
});
  

 