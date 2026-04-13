import { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { ref, set, push, onValue, remove, update } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import "./app.css";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [imagemBase64, setImagemBase64] = useState("");
  const [preview, setPreview] = useState("");

  const [remoteFeatures, setRemoteFeatures] = useState({ uploadImagem: false });
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. MONITOR DE AUTH E ADMIN (CORRIGIDO SEM ERRO 321)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioLogado) => {
      setUser(usuarioLogado);
      
      if (usuarioLogado) {
        // Se logou, verifica o cargo no banco
        const userRef = ref(db, `users/${usuarioLogado.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          console.log("DADOS DO ADMIN NO BANCO:", data); // Verifique se aparece {role: 'admin'}
          setIsAdmin(data?.role === "admin");
        });
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. MONITOR DE FEATURES
  useEffect(() => {
    const featRef = ref(db, "features");
    onValue(featRef, (snapshot) => {
      const data = snapshot.val();
      setRemoteFeatures({ uploadImagem: data?.uploadImagem === true });
    });
  }, []);

  // 3. MONITOR DE LISTA DE LEITORES
  useEffect(() => {
    if (user) {
      const usuariosRef = ref(db, "usuarios");
      onValue(usuariosRef, (snapshot) => {
        const data = snapshot.val();
        setUsuarios(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []);
      });
    }
  }, [user]);

  const handleCadastrar = () => {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        set(ref(db, `logins/${userCredential.user.uid}`), {
          email: userCredential.user.email,
          ultimoLogin: new Date().toLocaleString("pt-BR"),
          acao: "Cadastro"
        });
      })
      .catch((erro) => alert("Erro: " + erro.message));
  };

  const handleLogar = () => {
    signInWithEmailAndPassword(auth, email, senha).catch((erro) => alert("Erro: " + erro.message));
  };

  const salvarUsuario = (e) => {
    e.preventDefault();
    if (!nome) return alert("Nome vazio!");

    const dados = { nome };
    if (remoteFeatures.uploadImagem && imagemBase64) {
      dados.imagem = imagemBase64;
    } else {
      dados.imagem = null;
    }

    if (idSelecionado) {
      update(ref(db, `usuarios/${idSelecionado}`), dados).then(limpar);
    } else {
      push(ref(db, "usuarios"), dados).then(limpar);
    }
  };

  const limpar = () => {
    setNome("");
    setIdSelecionado(null);
    setImagemBase64("");
    setPreview("");
  };

  if (!user) {
    return (
      <div className="container">
        <div className="box">
          <h1>Biblioteca Central</h1>
          <input placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <button onClick={handleLogar}>Entrar</button>
          <button onClick={handleCadastrar} className="link-btn">Criar conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h2>📖 Painel Administrativo</h2>
        
        {/* BOTÃO EXCLUSIVO ADMIN */}
        {isAdmin && (
          <div className="box" style={{ border: "2px solid green", padding: "10px", margin: "10px 0" }}>
            <p>Upload: <strong>{remoteFeatures.uploadImagem ? "ATIVADO" : "DESATIVADO"}</strong></p>
            <button onClick={() => update(ref(db, "features"), { uploadImagem: !remoteFeatures.uploadImagem })}>
              Alternar Upload de Imagem
            </button>
          </div>
        )}

        <div>
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)}>Sair</button>
        </div>
      </header>

      <div className="box">
        <h3>{idSelecionado ? "Atualizar" : "Cadastrar"} Leitor</h3>
        <form onSubmit={salvarUsuario} className="form">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />

          {remoteFeatures.uploadImagem && (
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (!file || file.size > 300000) return alert("Imagem muito grande!");
              const reader = new FileReader();
              reader.onloadend = () => { setImagemBase64(reader.result); setPreview(reader.result); };
              reader.readAsDataURL(file);
            }} />
          )}

          {preview && remoteFeatures.uploadImagem && <img src={preview} className="img-preview" alt="preview" />}
          <button type="submit">{idSelecionado ? "Atualizar" : "Salvar"}</button>
        </form>
      </div>

      <div className="box">
        <h4>Lista de Leitores</h4>
        <table>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.nome}
                  {remoteFeatures.uploadImagem && u.imagem && (
                    <div><img src={u.imagem} className="img-preview" alt="user" /></div>
                  )}
                </td>
                <td>
                  <button onClick={() => { setNome(u.nome); setIdSelecionado(u.id); setPreview(u.imagem || ""); setImagemBase64(u.imagem || ""); }}>Editar</button>
                  <button onClick={() => remove(ref(db, `usuarios/${u.id}`))}>Remover</button>
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
