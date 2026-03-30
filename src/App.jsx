import { features } from "./features";
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
  const [imagemBase64, setImagemBase64] = useState("");
  const [preview, setPreview] = useState("");

  // Autenticação
  useEffect(() => {
    onAuthStateChanged(auth, (usuarioLogado) => setUser(usuarioLogado));
  }, []);

  // Carregar usuários
  useEffect(() => {
    if (!user) return;
    const usuariosRef = ref(db, "usuarios");
    onValue(usuariosRef, (snapshot) => {
      const data = snapshot.val();
      setUsuarios(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []
      );
    });
  }, [user]);

  // Função para processar arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Selecione apenas imagens");
    if (file.size > 500000) return alert("Imagem muito grande (máx 500KB)");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemBase64(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Salvar ou atualizar usuário
  const salvarUsuario = (e) => {
    e.preventDefault();
    if (!nome) return;

    const dados = { nome, imagem: imagemBase64 || null };

    if (idSelecionado) {
      update(ref(db, `usuarios/${idSelecionado}`), dados).then(() => limparCampos());
    } else {
      const novoUsuarioRef = push(ref(db, "usuarios"));
      set(novoUsuarioRef, dados).then(() => limparCampos());
    }
  };

  const limparCampos = () => {
    setNome("");
    setIdSelecionado(null);
    setImagemBase64("");
    setPreview("");
  };

  // Login / Cadastro
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
      .catch((erro) => alert("Erro: " + erro.message));
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
      .catch((erro) => alert("Acesso negado: " + erro.message));
  };

  if (!user) {
    return (
      <div className="container">
        <div className="box">
          <h1>Biblioteca Central</h1>
          <p>Gerenciamento de Leitores</p>
          <input placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" onChange={(e) => setSenha(e.target.value)} />
          <button onClick={handleLogar}>Entrar</button>
          <button onClick={handleCadastrar}>Criar conta</button>
        </div>
      </div>
    );
  }

  // Painel Administrativo
  return (
    <div className="container">
      <header className="header">
        <h2>📖 Painel Administrativo</h2>
        <div>
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)}>Sair</button>
        </div>
      </header>

      <div className="box">
        <h3>{idSelecionado ? "Atualizar Leitor" : "Cadastrar Novo Leitor"}</h3>
        <form onSubmit={salvarUsuario} className="form">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do leitor" />
          {features.uploadImagem && (
            <>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {preview && <img src={preview} alt="Preview" className="img-preview" />}
            </>
          )}
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
                  📜 {u.nome}
                  {u.imagem && <img src={u.imagem} alt={u.nome} className="img-preview" />}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setNome(u.nome);
                      setIdSelecionado(u.id);
                      setImagemBase64(u.imagem || "");
                      setPreview(u.imagem || "");
                    }}
                  >
                    Editar
                  </button>
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