const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new sqlite3.Database(':memory:'); // In-memory database for simplicity

// Membuat tabel pengguna
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    nama TEXT,
    hp TEXT,
    password TEXT
  )
`);

// Membuat tabel barang
db.run(`
  CREATE TABLE IF NOT EXISTS barang (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    nama TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

let currentUser = null;

function registerUser() {
  rl.question('Masukkan nama: ', (nama) => {
    rl.question('Masukkan nomor hp: ', (hp) => {
      rl.question('Masukkan password: ', (password) => {
        db.run(
          'INSERT INTO users (nama, hp, password) VALUES (?, ?, ?)',
          [nama, hp, password],
          (err) => {
            if (err) {
              console.error('Gagal mendaftar:', err.message);
            } else {
              console.log('Pengguna terdaftar dengan ID:', this.lastID);
            }
            mainMenu();
          }
        );
      });
    });
  });
}

function loginUser() {
  rl.question('Masukkan nomor hp: ', (hp) => {
    rl.question('Masukkan password: ', (password) => {
      db.get(
        'SELECT * FROM users WHERE hp = ? AND password = ?',
        [hp, password],
        (err, row) => {
          if (err) {
            console.error('Error saat login:', err.message);
            mainMenu();
          } else if (row) {
            currentUser = row.id;
            console.log('Berhasil login!');
            mainMenu();
          } else {
            console.log('Nomor hp atau password salah.');
            mainMenu();
          }
        }
      );
    });
  });
}

function tambahBarang() {
  rl.question('Masukkan nama barang: ', (namaBarang) => {
    db.run(
      'INSERT INTO barang (user_id, nama) VALUES (?, ?)',
      [currentUser, namaBarang],
      (err) => {
        if (err) {
          console.error('Gagal menambah barang:', err.message);
        } else {
          console.log('Barang berhasil ditambahkan.');
        }
        mainMenu();
      }
    );
  });
}

function lihatBarangku() {
  db.all(
    'SELECT * FROM barang WHERE user_id = ?',
    [currentUser],
    (err, rows) => {
      if (err) {
        console.error('Error saat mengambil data barang:', err.message);
      } else {
        console.log('Barang milik Anda:');
        rows.forEach((row) => {
          console.log(`ID: ${row.id}, Nama: ${row.nama}`);
        });
      }
      mainMenu();
    }
  );
}

function hapusBarang() {
  rl.question('Masukkan ID barang yang akan dihapus: ', (barangId) => {
    db.run(
      'DELETE FROM barang WHERE id = ? AND user_id = ?',
      [barangId, currentUser],
      (err) => {
        if (err) {
          console.error('Gagal menghapus barang:', err.message);
        } else {
          console.log('Barang berhasil dihapus.');
        }
        mainMenu();
      }
    );
  });
}

function mainMenu() {
  if (currentUser === null) {
    console.log('1. Registrasi Pengguna');
    console.log('2. Login');
  } else {
    console.log('1. Tambah Barang');
    console.log('2. Lihat Barangku');
    console.log('3. Hapus Barang');
    console.log('4. Logout');
  }

  rl.question('Pilih menu: ', (menu) => {
    if (currentUser === null) {
      if (menu === '1') {
        registerUser();
      } else if (menu === '2') {
        loginUser();
      } else {
        console.log('Menu tidak valid.');
        mainMenu();
      }
    } else {
      if (menu === '1') {
        tambahBarang();
      } else if (menu === '2') {
        lihatBarangku();
      } else if (menu === '3') {
        hapusBarang();
      } else if (menu === '4') {
        currentUser = null;
        console.log('Berhasil logout.');
        mainMenu();
      } else {
        console.log('Menu tidak valid.');
        mainMenu();
      }
    }
  });
}

mainMenu();