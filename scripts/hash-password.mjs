// Gera o hash bcrypt da senha do administrador.
// Uso: npm run hash-password -- "minhaSenhaForte"
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const pwd = process.argv[2];
if (!pwd || pwd.length < 10) {
  console.error('Informe uma senha com pelo menos 10 caracteres:  npm run hash-password -- "SuaSenhaForte123"');
  process.exit(1);
}
// O hash bcrypt contém "$", que o carregador de .env do Next.js interpreta.
// Por isso ele é gravado em base64 com o prefixo "b64:" (o site decodifica automaticamente).
const hash = "b64:" + Buffer.from(bcrypt.hashSync(pwd, 12)).toString("base64");
console.log("\nCole no .env.local (ou nas variáveis de ambiente da hospedagem):\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`AUTH_SECRET=${randomBytes(48).toString("base64url")}\n`);
console.log("(AUTH_SECRET só precisa ser gerado uma vez; trocar invalida as sessões abertas.)\n");
