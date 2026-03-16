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

  // Monitora se o usuário está logado ou não
  useEffect(() => {
    onAuthStateChanged(auth, (usuarioLogado) => {
      setUser(usuarioLogado);
    });
  }, []);

  // Funções de Autenticação
  const handleCadastrar = () => {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // Opcional: Registrar também quando um novo usuário acaba de ser criado
        const usuario = userCredential.user;
        set(ref(db, `logins/${usuario.uid}`), {
          email: usuario.email,
          ultimoLogin: new Date().toLocaleString("pt-BR"),
          acao: "Cadastro Novo"
        });
      })
      .catch(erro => alert("Erro ao cadastrar: " + erro.message));
  };

  const handleLogar = () => {
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // --- NOVO: SALVANDO O REGISTRO DE LOGIN NO BANCO ---
        const usuario = userCredential.user;
        const loginRef = ref(db, `logins/${usuario.uid}`);
        
        set(loginRef, {
          email: usuario.email,
          ultimoLogin: new Date().toLocaleString("pt-BR"),
          uid: usuario.uid
        });
      })
      .catch(erro => alert("Erro ao logar: " + erro.message));
  };

  const handleSair = () => signOut(auth);

  // Lógica do CRUD (só roda se houver usuário logado)
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

  // TELA 1: LOGIN (Se não estiver logado)
  if (!user) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h1>Login do Sistema</h1>
        <input placeholder="E-mail" onChange={e => setEmail(e.target.value)} style={{marginBottom: '5px'}} /><br/>
        <input type="password" placeholder="Senha" onChange={e => setSenha(e.target.value)} /><br/><br/>
        <button onClick={handleLogar}>Entrar</button>
        <button onClick={handleCadastrar} style={{ marginLeft: "10px" }}>Cadastrar</button>
      </div>
    );
  }

  // TELA 2: CRUD (Se estiver logado)
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", background: "#eee", padding: "10px" }}>
        <span>Logado como: <b>{user.email}</b></span>
        <button onClick={handleSair}>Sair</button>
      </div>

      <h1>Meu CRUD Seguro</h1>
      <form onSubmit={salvarUsuario}>
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" />
        <button type="submit">{idSelecionado ? "Atualizar" : "Salvar"}</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {usuarios.map(u => (
          <li key={u.id} style={{marginTop: '10px', padding: '5px', borderBottom: '1px solid #ccc'}}>
            {u.nome} 
            <button onClick={() => { setNome(u.nome); setIdSelecionado(u.id); }} style={{marginLeft: '10px'}}>Editar</button>
            <button onClick={() => remove(ref(db, `usuarios/${u.id}`))} style={{marginLeft: '5px', color: 'red'}}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
