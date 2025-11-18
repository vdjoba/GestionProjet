import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'

const FILIERES = [
  'Génie Civil',
  'Génie Physique',
  'Génie Mécanique',
  'Génie Énergétique',
  'Génie des Procédés',
  'Génie Maritime et Portuaire',
  'Génie Automobile et Mécatronique',
  'Génie de la Qualité Hygiène, Sécurité et Environnement Industriel',
  'Génie Électrique et Systèmes Intelligents',
  'Génie Informatique & Télécommunications',
  'Master Professionnel'
];

// SUPPRIMER la première définition de Home ici
// function Home() {
//   const projetsParFiliere = {
//     GIT: ['Système de gestion de bibliothèque', 'Application mobile de suivi scolaire'],
//     GESI: ['Optimisation des réseaux électriques', 'Gestion intelligente de l’énergie'],
//     GAM: ['Modélisation 3D d’un bâtiment', 'Analyse structurelle avancée'],
//     GCI: ['Ponts et ouvrages d’art', 'Gestion des eaux urbaines'],
//     GE: ['Production d’énergie renouvelable', 'Smart Grid'],
//     GM: ['Conception d’un moteur thermique', 'Simulation mécanique'],
//     QSHE: ['Audit sécurité industrielle', 'Gestion environnementale'],
//     GP: ['Gestion de la production', 'Optimisation des flux logistiques'],
//     GMP: ['Maintenance prédictive', 'Gestion des équipements'],
//     GEE: ['Électronique embarquée', 'Systèmes de contrôle'],
//     GIM: ['Instrumentation industrielle', 'Automatisation des procédés']
//   };
//
//   return (
//     <div style={{textAlign:'center'}}>
//       <img src="/ENSPDr.webp" alt="Logo ENSPD" style={{width:'180px', marginBottom:'1em'}} />
//       <h1 style={{color:'#0057b7'}}>Bienvenue sur la plateforme de gestion des projets ENSPD</h1>
//       <p style={{color:'#ff7900', fontWeight:'bold'}}>Retrouvez les projets récents de toutes les filières !</p>
//       <section style={{margin:'2em auto', maxWidth:'900px', background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #0057b7'}}>
//         <h2 style={{color:'#0057b7', marginBottom:'1em'}}>Projets récents par filière</h2>
//         <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5em'}}>
//           {Object.entries(projetsParFiliere).map(([filiere, projets]) => (
//             <div key={filiere} style={{background:'#e6f0ff', borderRadius:'8px', padding:'1em', border:'1px solid #ff7900'}}>
//               <h3 style={{color:'#ff7900', marginBottom:'0.5em'}}>{filiere}</h3>
//               <ul style={{textAlign:'left'}}>
//                 {projets.map((p, idx) => <li key={idx} style={{color:'#0057b7'}}>{p}</li>)}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </section>
//       <section style={{margin:'2em auto', maxWidth:'700px', background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #ff7900'}}>
//         <h2 style={{color:'#ff7900'}}>Événements à venir</h2>
//         <ul style={{color:'#0057b7', fontWeight:'bold'}}>
//           <li>Journée portes ouvertes ENSPD</li>
//           <li>Défense des projets de fin d’études</li>
//           <li>Forum des métiers de l’ingénieur</li>
//         </ul>
//       </section>
//     </div>
//   )
// }

function Dashboard({currentUser}) {
  if (!currentUser) {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  if (currentUser.type !== 'étudiant') {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Accès réservé aux étudiants.</div>;
  }
  // Récupérer les projets soumis par l'étudiant connecté
  const projets = (JSON.parse(localStorage.getItem('projets')) || []).filter(p => p.auteur === currentUser.nom && p.filiere === currentUser.filiere);
  return (
    <div>
      <h2 style={{color:'#0057b7'}}>Tableau de bord étudiant</h2>
      <section style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #0057b7'}}>
        <h3 style={{color:'#ff7900'}}>Projets soumis</h3>
        {projets.length === 0 ? (
          <div style={{color:'#999'}}>Aucun projet soumis pour l'instant.</div>
        ) : (
          <ul>
            {projets.map((p, idx) => (
              <li key={idx} style={{marginBottom:'1em'}}>
                <b>{p.titre}</b><br/>
                <span style={{fontSize:'0.9em'}}>{p.date ? new Date(p.date).toLocaleDateString() : ''}</span><br/>
                <span style={{fontSize:'0.9em', color:'#333'}}>{p.description}</span><br/>
                {p.fichier && <span style={{fontSize:'0.9em', color:'#0057b7'}}>Fichier : {p.fichier}</span>}<br/>
                {p.lien && <span style={{fontSize:'0.9em', color:'#0057b7'}}>Lien : <a href={p.lien} target="_blank" rel="noopener noreferrer">{p.lien}</a></span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function SubmitProject({currentUser}) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [fichier, setFichier] = useState(null);
  const [lien, setLien] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    let fichierNom = "";
    if (fichier) {
      fichierNom = fichier.name;
      // Pour une vraie appli, il faudrait uploader le fichier sur un serveur
      // Ici, on ne fait que stocker le nom pour la démo
    }
    const projet = {
      titre,
      description,
      fichier: fichierNom,
      lien,
      filiere: currentUser ? currentUser.filiere : '',
      auteur: currentUser ? currentUser.nom : '',
      date: new Date().toISOString()
    };
    const projets = JSON.parse(localStorage.getItem('projets')) || [];
    projets.push(projet);
    localStorage.setItem('projets', JSON.stringify(projets));
    setTitre("");
    setDescription("");
    setFichier(null);
    setLien("");
    navigate('/');
  }

  return (
    <div>
      <h2 style={{color:'#0057b7'}}>Soumission de projet</h2>
      <section style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #0057b7'}}>
        <form onSubmit={handleSubmit}>
          <label>Titre du projet :</label><br/>
          <input type="text" value={titre} onChange={e=>setTitre(e.target.value)} style={{marginBottom:'1em', width:'100%'}} required /><br/>
          <label>Description :</label><br/>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{marginBottom:'1em', width:'100%'}} required /><br/>
          <label>Fichier du projet (PDF, ZIP…) : <span style={{color:'#999'}}>(facultatif)</span></label><br/>
          <input type="file" onChange={e=>setFichier(e.target.files[0])} style={{marginBottom:'1em', width:'100%'}} /><br/>
          <label>Lien du projet déployé : <span style={{color:'#999'}}>(facultatif)</span></label><br/>
          <input type="url" value={lien} onChange={e=>setLien(e.target.value)} style={{marginBottom:'1em', width:'100%'}} placeholder="https://..." /><br/>
          <button type="submit" style={{background:'#0057b7', color:'#fff', border:'none', borderRadius:'4px', padding:'0.5em 1em'}}>Soumettre</button>
        </form>
      </section>
    </div>
  )
}

function Home() {
  const projets = JSON.parse(localStorage.getItem('projets')) || [];
  const projetsParFiliere = {};
  FILIERES.forEach(filiere => {
    projetsParFiliere[filiere] = projets
      .filter(p => p.filiere === filiere)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  });

  return (
    <div style={{textAlign:'center'}}>
      <img src="/ENSPDr.webp" alt="Logo ENSPD" style={{width:'180px', marginBottom:'1em'}} />
      <h1 style={{color:'#0057b7'}}>Bienvenue sur la plateforme de gestion des projets de fin d'étude ENSPD</h1>
      <p style={{color:'#ff7900', fontWeight:'bold'}}>Retrouvez les 5 derniers projets de chaque filière !</p>
      <section style={{margin:'2em auto', maxWidth:'900px', background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #0057b7'}}>
        <h2 style={{color:'#0057b7', marginBottom:'1em'}}>Projets récents par filière</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5em'}}>
          {FILIERES.map(filiere => (
            <div key={filiere} style={{background:'#e6f0ff', borderRadius:'8px', padding:'1em', border:'1px solid #ff7900'}}>
              <h3 style={{color:'#ff7900', marginBottom:'0.5em'}}>{filiere}</h3>
              <ul style={{textAlign:'left'}}>
                {projetsParFiliere[filiere].length === 0 ? (
                  <li style={{color:'#999'}}>Aucun projet soumis</li>
                ) : (
                  projetsParFiliere[filiere].map((p, idx) => (
                    <li key={idx} style={{color:'#0057b7'}}>
                      <b>{p.titre}</b><br/>
                      <span style={{fontSize:'0.9em'}}>{p.auteur} — {new Date(p.date).toLocaleDateString()}</span>
                      <br/><span style={{fontSize:'0.9em', color:'#333'}}>{p.description}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section style={{margin:'2em auto', maxWidth:'700px', background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #ff7900'}}>
        <h2 style={{color:'#ff7900'}}>Événements à venir</h2>
        <ul style={{color:'#0057b7', fontWeight:'bold'}}>
          <li>Journée portes ouvertes ENSPD</li>
          <li>Défense des projets de fin d’études</li>
          <li>Forum des métiers de l’ingénieur</li>
        </ul>
      </section>
    </div>
  )
}

function Evaluation({currentUser}) {
  if (!currentUser) {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  if (currentUser.type !== 'enseignant') {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Accès réservé aux enseignants.</div>;
  }
  return (
    <div>
      <h2 style={{color:'#0057b7'}}>Évaluation des projets</h2>
      <section style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #0057b7'}}>
        <h3 style={{color:'#ff7900'}}>Projets à évaluer</h3>
        <ul>
          <li>Projet 1 <button style={{background:'#0057b7', color:'#fff', border:'none', borderRadius:'4px', marginLeft:'1em'}}>Évaluer</button></li>
          <li>Projet 2 <button style={{background:'#0057b7', color:'#fff', border:'none', borderRadius:'4px', marginLeft:'1em'}}>Évaluer</button></li>
        </ul>
      </section>
    </div>
  )
}

function Profile({currentUser}) {
  if (!currentUser) {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Veuillez vous connecter pour accéder à votre profil.</div>;
  }
  return (
    <div>
      <h2 style={{color:'#0057b7'}}>Profil utilisateur</h2>
      <section style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #0057b7', maxWidth:'400px', margin:'auto'}}>
        <p><b>Nom :</b> {currentUser.nom}</p>
        <p><b>Email :</b> {currentUser.email}</p>
        {currentUser.matricule && <p><b>Matricule :</b> {currentUser.matricule}</p>}
        {currentUser.filiere && <p><b>Filière :</b> {currentUser.filiere}</p>}
        {currentUser.mention && <p><b>Mention :</b> {currentUser.mention}</p>}
        <p><b>Type :</b> {currentUser.type}</p>
        <h3 style={{color:'#ff7900'}}>Historique des projets</h3>
        {/* Ici, tu peux ajouter l'affichage des projets soumis par l'utilisateur si tu veux */}
      </section>
    </div>
  )
}

function Forum() {
  return (
    <div>
      <h2 style={{color:'#0057b7'}}>Forum</h2>
      <section style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #ff7900'}}>
        <h3 style={{color:'#ff7900'}}>Discussions récentes</h3>
        <ul>
          <li>Comment bien préparer sa soutenance ?</li>
          <li>Idées de projets innovants</li>
        </ul>
      </section>
      <form style={{marginTop:'1em'}}>
        <input type="text" placeholder="Votre question..." style={{width:'70%', marginRight:'1em'}} />
        <button type="submit" style={{background:'#0057b7', color:'#fff', border:'none', padding:'0.5em 1em', borderRadius:'4px'}}>Poster</button>
      </form>
    </div>
  )
}

function Register() {
  const [type, setType] = useState('etudiant');
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [filiere, setFiliere] = useState(FILIERES[0]);
  const [mention, setMention] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      setMessage('Cet email est déjà utilisé.');
      return;
    }
    const user = { type, nom, email, password };
    if (type === 'etudiant') {
      user.matricule = matricule;
      user.filiere = filiere;
      user.mention = mention;
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    setMessage('Inscription réussie ! Vous pouvez vous connecter.');
    setTimeout(() => navigate('/login'), 1500);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'2em'}}>
      <h2 style={{color:'#0057b7'}}>Inscription</h2>
      <form style={{background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #0057b7', maxWidth:'400px', width:'100%', boxShadow:'0 2px 12px #0057b733'}} onSubmit={handleSubmit}>
        <div style={{marginBottom:'1em'}}>
          <label>Type de compte</label><br/>
          <select value={type} onChange={e => setType(e.target.value)} style={{width:'100%'}}>
            <option value="etudiant">Étudiant</option>
            <option value="enseignant">Enseignant</option>
          </select>
        </div>
        <div style={{marginBottom:'1em'}}>
          <label>Nom</label><br/>
          <input type="text" style={{width:'100%'}} required value={nom} onChange={e => setNom(e.target.value)} />
        </div>
        {type === 'etudiant' && (
          <>
            <div style={{marginBottom:'1em'}}>
              <label>Matricule</label><br/>
              <input type="text" style={{width:'100%'}} required value={matricule} onChange={e => setMatricule(e.target.value)} />
            </div>
            <div style={{marginBottom:'1em'}}>
              <label>Filière</label><br/>
              <select style={{width:'100%'}} value={filiere} onChange={e => setFiliere(e.target.value)}>
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{marginBottom:'1em'}}>
              <label>Mention obtenue lors de la soutenance</label><br/>
              <input type="text" style={{width:'100%'}} required value={mention} onChange={e => setMention(e.target.value)} />
            </div>
          </>
        )}
        <div style={{marginBottom:'1em'}}>
          <label>Email</label><br/>
          <input type="email" style={{width:'100%'}} required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{marginBottom:'1em'}}>
          <label>Mot de passe</label><br/>
          <div style={{position:'relative'}}>
            <input type={showPassword ? 'text' : 'password'} style={{width:'100%'}} required value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:'absolute', right:'8px', top:'8px', background:'none', border:'none', cursor:'pointer'}}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" style={{background:'#ff7900', color:'#fff', border:'none', padding:'0.5em 1em', borderRadius:'4px', width:'100%'}}>S'inscrire</button>
        {message && <div style={{marginTop:'1em', color:'#0057b7'}}>{message}</div>}
      </form>
    </div>
  )
}

function Login({setCurrentUser}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      setMessage('Identifiants incorrects.');
      return;
    }
    setCurrentUser(user);
    setMessage('Connexion réussie !');
    setTimeout(() => navigate('/'), 1200);
  }

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginTop:'2em'}}>
      <h2 style={{color:'#0057b7'}}>Connexion</h2>
      <form style={{background:'#fff', borderRadius:'12px', padding:'2em', border:'2px solid #0057b7', maxWidth:'400px', width:'100%', boxShadow:'0 2px 12px #0057b733'}} onSubmit={handleSubmit}>
        <div style={{marginBottom:'1em'}}>
          <label>Email</label><br/>
          <input type="email" style={{width:'100%'}} required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{marginBottom:'1em'}}>
          <label>Mot de passe</label><br/>
          <div style={{position:'relative'}}>
            <input type={showPassword ? 'text' : 'password'} style={{width:'100%'}} required value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:'absolute', right:'8px', top:'8px', background:'none', border:'none', cursor:'pointer'}}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button type="submit" style={{background:'#0057b7', color:'#fff', border:'none', padding:'0.5em 1em', borderRadius:'4px', width:'100%'}}>Se connecter</button>
        {message && <div style={{marginTop:'1em', color:'#0057b7'}}>{message}</div>}
      </form>
    </div>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  function handleLogout() {
    setCurrentUser(null);
    navigate('/');
  }

  return (
    <>
      <nav style={{marginBottom: '2em', background:'#0057b7', padding:'1em', borderRadius:'8px'}}>
        <Link to="/" style={{color:'#fff', marginRight:'1em'}}>Accueil</Link>
        <Link to="/dashboard" style={{color:'#fff', marginRight:'1em'}}>Tableau de bord</Link>
        <Link to="/submit" style={{color:'#fff', marginRight:'1em'}}>Soumission</Link>
        <Link to="/evaluation" style={{color:'#fff', marginRight:'1em'}}>Évaluation</Link>
        <Link to="/profile" style={{color:'#fff', marginRight:'1em'}}>Profil</Link>
        <Link to="/forum" style={{color:'#fff', marginRight:'1em'}}>Forum</Link>
        <Link to="/evenements" style={{color:'#fff', marginRight:'1em', fontWeight:'bold'}}>Gestion événements</Link>
        <Link to="/register" style={{color:'#fff', marginRight:'1em', fontWeight:'bold'}}>Inscription</Link>
        <Link to="/login" style={{color:'#fff', fontWeight:'bold'}}>Connexion</Link>
        {currentUser && <button onClick={handleLogout} style={{marginLeft:'2em', background:'#ff7900', color:'#fff', border:'none', borderRadius:'4px', padding:'0.5em 1em', fontWeight:'bold'}}>Déconnexion</button>}
      </nav>
      {currentUser && (
        <div style={{background:'#e6f0ff', color:'#0057b7', padding:'0.5em 1em', borderRadius:'8px', marginBottom:'1em', textAlign:'center'}}>
          Connecté en tant que <b>{currentUser.nom}</b> ({currentUser.type})
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
        <Route path="/submit" element={<SubmitProject currentUser={currentUser} />} />
        <Route path="/evaluation" element={<Evaluation currentUser={currentUser} />} />
        <Route path="/profile" element={<Profile currentUser={currentUser} />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/evenements" element={<GestionEvenements currentUser={currentUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
      </Routes>
    </>
  )
}

export default App

function GestionEvenements({currentUser}) {
  const [evenements, setEvenements] = useState(() => JSON.parse(localStorage.getItem('evenements')) || []);
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState("");

  // Contrôle d'accès : enseignants ou admin
  if (!currentUser || (currentUser.type !== 'enseignant' && currentUser.type !== 'admin')) {
    return <div style={{color:'#ff7900', textAlign:'center', marginTop:'2em'}}>Accès réservé aux enseignants ou administrateurs.</div>;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!titre || !date) {
      setMessage('Veuillez remplir tous les champs.');
      return;
    }
    let newEvenements = [...evenements];
    if (editIndex !== null) {
      newEvenements[editIndex] = { titre, date };
      setEditIndex(null);
      setMessage('Événement modifié.');
    } else {
      newEvenements.push({ titre, date });
      setMessage('Événement ajouté.');
    }
    setEvenements(newEvenements);
    localStorage.setItem('evenements', JSON.stringify(newEvenements));
    setTitre("");
    setDate("");
  }

  function handleEdit(idx) {
    setTitre(evenements[idx].titre);
    setDate(evenements[idx].date);
    setEditIndex(idx);
  }

  function handleDelete(idx) {
    const newEvenements = evenements.filter((_, i) => i !== idx);
    setEvenements(newEvenements);
    localStorage.setItem('evenements', JSON.stringify(newEvenements));
    setMessage('Événement supprimé.');
    setTitre("");
    setDate("");
    setEditIndex(null);
  }

  return (
    <div style={{maxWidth:'600px', margin:'2em auto'}}>
      <h2 style={{color:'#0057b7'}}>Gestion des événements à venir</h2>
      <form onSubmit={handleSubmit} style={{background:'#fff', borderRadius:'8px', padding:'1em', border:'2px solid #0057b7', marginBottom:'2em'}}>
        <label>Titre de l'événement :</label><br/>
        <input type="text" value={titre} onChange={e=>setTitre(e.target.value)} style={{width:'100%', marginBottom:'1em'}} required /><br/>
        <label>Date :</label><br/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%', marginBottom:'1em'}} required /><br/>
        <button type="submit" style={{background:'#ff7900', color:'#fff', border:'none', borderRadius:'4px', padding:'0.5em 1em'}}>{editIndex !== null ? 'Modifier' : 'Ajouter'}</button>
        {message && <div style={{marginTop:'1em', color:'#0057b7'}}>{message}</div>}
      </form>
      <h3 style={{color:'#ff7900'}}>Liste des événements</h3>
      <ul>
        {evenements.length === 0 ? <div style={{color:'#999'}}>Aucun événement pour l'instant.</div> : evenements.map((ev, idx) => (
          <li key={idx} style={{marginBottom:'1em', background:'#f9f9f9', padding:'1em', borderRadius:'6px', border:'1px solid #eee'}}>
            <b>{ev.titre}</b> <span style={{color:'#0057b7'}}>{ev.date}</span><br/>
            <button onClick={()=>handleEdit(idx)} style={{marginRight:'1em', background:'#0057b7', color:'#fff', border:'none', borderRadius:'4px', padding:'0.3em 0.8em'}}>Modifier</button>
            <button onClick={()=>handleDelete(idx)} style={{background:'#ff7900', color:'#fff', border:'none', borderRadius:'4px', padding:'0.3em 0.8em'}}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
