import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { ref, set, push, onValue, remove, update } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [idSelecionado, setIdSelecionado] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (usuarioLogado) => setUser(usuarioLogado));
  }, []);

  const handleCadastrar = () => {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const usuario = userCredential.user;
        set(ref(db, `logins/${usuario.uid}`), {
          email: usuario.email,
          ultimoLogin: new Date().toLocaleString("pt-BR"),
          acao: "Cadastro Biblioteca"
        });
      })
      .catch(erro => alert("Erro: " + erro.message));
  };

  const handleLogar = () => {
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const usuario = userCredential.user;
        set(ref(db, `logins/${usuario.uid}`), {
          email: usuario.email,
          ultimoLogin: new Date().toLocaleString("pt-BR"),
          uid: usuario.uid
        });
      })
      .catch(erro => alert("Acesso negado: " + erro.message));
  };

  useEffect(() => {
    if (user) {
      const usuariosRef = ref(db, "usuarios/");
      onValue(usuariosRef, (snapshot) => {
        const data = snapshot.val();
        setUsuarios(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      });
    }
  }, [user]);

  const salvarUsuario = (e) => {
    e.preventDefault();
    if (nome === "") return;
    const caminho = idSelecionado ? `usuarios/${idSelecionado}` : `usuarios/`;
    const acao = idSelecionado ? update : (r, d) => set(push(r), d);
    acao(ref(db, caminho), { nome }).then(() => { setNome(""); setIdSelecionado(null); });
  };

  // --- ESTILOS TEMÁTICOS: BIBLIOTECA CLASSICA ---
  const styles = {
    body: {
      backgroundColor: "#fdfaf6", // Cor de papel antigo
      minHeight: "100vh",
      fontFamily: "'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
      color: "#2c3e50"
    },
    loginBox: {
      backgroundColor: "#fff",
      padding: "40px",
      borderRadius: "4px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      borderTop: "6px solid #1a3c5a", // Azul Marinho
      width: "100%",
      maxWidth: "380px",
      textAlign: "center"
    },
    title: { fontSize: "28px", color: "#1a3c5a", marginBottom: "10px", fontWeight: "normal" },
    subtitle: { fontSize: "14px", color: "#7f8c8d", marginBottom: "30px", fontStyle: "italic" },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      border: "1px solid #dcdde1",
      borderRadius: "3px",
      fontSize: "14px",
      backgroundColor: "#fcfcfc"
    },
    btnMain: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#1a3c5a",
      color: "#f1c40f", // Dourado
      border: "none",
      borderRadius: "3px",
      cursor: "pointer",
      fontSize: "16px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontWeight: "bold",
      marginBottom: "10px"
    },
    header: {
      width: "100%",
      maxWidth: "900px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid #1a3c5a",
      paddingBottom: "10px",
      marginBottom: "40px"
    },
    table: {
      width: "100%",
      maxWidth: "900px",
      backgroundColor: "#fff",
      borderCollapse: "collapse",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    },
    row: { borderBottom: "1px solid #eee" },
    cell: { padding: "15px", textAlign: "left" }
  };

  if (!user) {
    return (
      <div style={styles.body}>
        <div style={styles.loginBox}>
          <h1 style={styles.title}>Biblioteca Central</h1>
          <p style={styles.subtitle}>Gerenciamento de Leitores</p>
          <input placeholder="Número da Credencial (E-mail)" onChange={e => setEmail(e.target.value)} style={styles.input} />
          <input type="password" placeholder="Chave de Acesso (Senha)" onChange={e => setSenha(e.target.value)} style={styles.input} />
          <button onClick={handleLogar} style={styles.btnMain}>Entrar</button>
          <button onClick={handleCadastrar} style={{ background: "none", border: "none", color: "#1a3c5a", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Solicitar Novo Registro</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <h2 style={{ margin: 0, color: "#1a3c5a" }}>📖 Painel Administrativo</h2>
        <div>
          <span style={{ marginRight: "15px", fontSize: "14px" }}>Bibliotecário: <b>{user.email}</b></span>
          <button onClick={() => signOut(auth)} style={{ cursor: "pointer", border: "1px solid #1a3c5a", background: "none", padding: "5px 10px" }}>Encerrar Sessão</button>
        </div>
      </header>

      <div style={{ ...styles.loginBox, maxWidth: "800px", marginBottom: "30px", borderTop: "4px solid #f1c40f" }}>
        <h3 style={{ marginTop: 0 }}>{idSelecionado ? "Atualizar Ficha" : "Cadastrar Novo Leitor"}</h3>
        <form onSubmit={salvarUsuario} style={{ display: "flex", gap: "10px" }}>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo do leitor" style={styles.input} />
          <button type="submit" style={{ ...styles.btnMain, width: "auto", padding: "0 30px", height: "45px" }}>
            {idSelecionado ? "Atualizar" : "Registrar"}
          </button>
        </form>
      </div>

      <div style={{ width: "100%", maxWidth: "800px" }}>
        <h4 style={{ borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Lista de Leitores Ativos</h4>
        <table style={styles.table}>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={styles.row}>
                <td style={styles.cell}>📜 {u.nome}</td>
                <td style={{ ...styles.cell, textAlign: "right" }}>
                  <button onClick={() => { setNome(u.nome); setIdSelecionado(u.id); }} style={{ marginRight: "10px", cursor: "pointer", color: "#2980b9", border: "none", background: "none" }}>[Editar]</button>
                  <button onClick={() => remove(ref(db, `usuarios/${u.id}`))} style={{ cursor: "pointer", color: "#c0392b", border: "none", background: "none" }}>[Remover]</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
