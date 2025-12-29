# 🔍 Guia Completo de Debugging - Upload de Imagens

## Checklist de Diagnóstico

### ✅ 1. Verifique a Configuração do Firebase

```bash
# No console do navegador (F12), execute:
console.log('Storage configurado:', firebase.storage() !== undefined);
console.log('Autenticado:', firebase.auth().currentUser !== null);
console.log('User ID:', firebase.auth().currentUser?.uid);
```

**O que verificar:**
- Storage está inicializado?
- Usuário está autenticado?
- O userId está correto?

---

### ✅ 2. Teste as Regras de Segurança

Vá para o **Firebase Console** → **Storage** → **Rules** → **Test Rules**

```javascript
// Teste 1: Leitura pública (deve PERMITIR)
match /logos/user123/logo.jpg
authenticated: false
operation: read
// Resultado esperado: ALLOW

// Teste 2: Escrita do dono (deve PERMITIR)
match /logos/user123/logo.jpg
authenticated: true
auth.uid: user123
operation: write
// Resultado esperado: ALLOW

// Teste 3: Escrita de outro usuário (deve NEGAR)
match /logos/user123/logo.jpg
authenticated: true
auth.uid: user456
operation: write
// Resultado esperado: DENY
```

---

### ✅ 3. Monitore o Console do Navegador

Abra o DevTools (F12) e vá para a aba **Console**:

```javascript
// Você deve ver estas mensagens:
📤 Iniciando upload: { fileName: "logo.png", fileSize: "1.2MB", path: "logos/user123" }
🗜️ Comprimindo imagem...
✅ Imagem comprimida: { originalSize: "1.2MB", compressedSize: "0.8MB" }
📊 Progresso: 25.0%
📊 Progresso: 50.0%
📊 Progresso: 75.0%
📊 Progresso: 100.0%
✅ Upload concluído: https://storage.googleapis.com/...
✅ Loja salva com sucesso!
```

**Se você ver erros:**

- ❌ `auth/user-not-found` → Usuário não está autenticado
- ❌ `storage/unauthorized` → Problema nas regras de segurança
- ❌ `storage/quota-exceeded` → Limite de armazenamento excedido
- ❌ `storage/invalid-checksum` → Arquivo corrompido

---

### ✅ 4. Verifique o Firebase Console

1. Vá para **Firebase Console** → **Storage**
2. Navegue até a pasta `logos/[userId]/`
3. Verifique se o arquivo foi criado
4. Clique no arquivo e copie a URL
5. Cole a URL no navegador para testar se abre

**Se o arquivo NÃO aparece:**
- Problema no upload ou nas permissões

**Se o arquivo aparece mas a URL não funciona:**
- Problema nas regras de leitura (read)

---

### ✅ 5. Teste a URL no Firestore

```bash
# No console do navegador:
const storeRef = doc(db, 'stores', 'SEU_USER_ID');
const storeData = await getDoc(storeRef);
console.log('Logo URL:', storeData.data()?.logoUrl);
```

**Verifique:**
- A URL foi salva corretamente?
- A URL é válida (começa com https://storage.googleapis.com/)?

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: "Upload não inicia"

**Sintomas:**
- Nada acontece ao selecionar arquivo
- Console sem mensagens

**Solução:**
```typescript
// Verifique se o input está correto:
<input
  type="file"
  accept="image/png,image/jpeg,image/jpg"
  onChange={handleFileSelect}  // ← Função conectada?
/>
```

---

### Problema 2: "Permissão negada (storage/unauthorized)"

**Sintomas:**
- Erro `storage/unauthorized` no console
- Upload falha imediatamente

**Soluções:**
1. Verifique se usuário está autenticado
2. Verifique se o path está correto: `logos/${userId}`
3. Atualize as regras no Firebase Console
4. Aguarde 1-2 minutos após atualizar regras

---

### Problema 3: "URL não salva no Firestore"

**Sintomas:**
- Upload funciona
- Arquivo aparece no Storage
- Mas URL não salva no banco

**Solução:**
```typescript
// Adicione logs antes de salvar:
console.log('URL obtida:', url);
console.log('Salvando no Firestore...');

await setDoc(storeRef, {
  logoUrl: url,  // ← Certifique-se que está aqui
  // ... outros campos
});

console.log('✅ Salvo com sucesso!');
```

---

### Problema 4: "Imagem não aparece depois de salvar"

**Sintomas:**
- URL salva corretamente
- Mas imagem não renderiza

**Soluções:**
1. Verifique o componente Image:
```typescript
<Image
  src={logoUrl || '/placeholder.jpg'}  // ← Fallback
  alt="Logo"
  width={200}
  height={200}
  // Importante para URLs externas:
  unoptimized={true}
/>
```

2. Configure o next.config.js:
```javascript
module.exports = {
  images: {
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
  },
}
```

---

## 🧪 Script de Teste Completo

Cole no console do navegador para testar todo o fluxo:

```javascript
(async () => {
  console.log('🧪 Iniciando testes...');
  
  // 1. Autenticação
  const user = firebase.auth().currentUser;
  console.log('1. Usuário:', user ? '✅ Autenticado' : '❌ Não autenticado');
  if (!user) return;
  
  // 2. Storage
  const storage = firebase.storage();
  console.log('2. Storage:', storage ? '✅ Configurado' : '❌ Não configurado');
  
  // 3. Teste de upload (arquivo pequeno de teste)
  const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
  const testPath = `test/${user.uid}/test.txt`;
  
  try {
    const ref = storage.ref(testPath);
    await ref.put(testFile);
    const url = await ref.getDownloadURL();
    console.log('3. Upload de teste:', '✅ Sucesso', url);
    
    // Limpa teste
    await ref.delete();
  } catch (error) {
    console.log('3. Upload de teste:', '❌ Falhou', error.message);
  }
  
  console.log('🧪 Testes concluídos!');
})();
```

---

## 📊 Monitoramento em Produção

Adicione logging estruturado:

```typescript
// src/lib/logger.ts
export const logger = {
  upload: {
    start: (fileName: string) => {
      console.log(`[UPLOAD] Iniciando: ${fileName}`);
    },
    progress: (fileName: string, progress: number) => {
      console.log(`[UPLOAD] ${fileName}: ${progress}%`);
    },
    success: (fileName: string, url: string) => {
      console.log(`[UPLOAD] ✅ Sucesso: ${fileName}`, { url });
    },
    error: (fileName: string, error: any) => {
      console.error(`[UPLOAD] ❌ Erro: ${fileName}`, error);
    }
  }
};
```

---

## 🚀 Melhorias Futuras

### 1. Upload em Lote
```typescript
async function uploadMultiple(files: File[], path: string) {
  const uploads = files.map(file => uploadFile(file, path));
  return Promise.all(uploads);
}
```

### 2. Redimensionamento no Backend
Use Cloud Functions:
```javascript
// functions/index.js
exports.resizeImage = functions.storage.object().onFinalize(async (object) => {
  // Redimensiona automaticamente após upload
});
```

### 3. CDN para Performance
Configure Firebase CDN nas regras de CORS.

---

## 📞 Suporte

Se o problema persistir:

1. ✅ Verifique todos os itens do checklist
2. 📸 Tire print dos erros no console
3. 🔍 Copie os logs completos
4. 💬 Descreva o comportamento esperado vs atual
5. 🔗 Compartilhe as regras de segurança atuais

**Links úteis:**
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)
- [Firebase Security Rules](https://firebase.google.com/docs/storage/security)
