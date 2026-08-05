const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace EmployeeDocument model
const oldModelRegex = /model EmployeeDocument \{[\s\S]*?@@map\("employee_documents"\)\s*\}/g;
const newModel = `model EmployeeDocument {
  documentId Int @id @default(autoincrement()) @map("document_id")

  userId Int @map("user_id")

  documentType DocumentType @map("document_type")

  fileName String @map("file_name")

  originalFileName String @map("original_file_name")

  mimeType String @map("mime_type")

  fileSize Int @map("file_size")

  fileData Bytes @db.ByteA @map("file_data")

  status Boolean @default(true)

  uploadedAt DateTime @default(now()) @map("uploaded_at")

  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@map("employee_documents")
}`;

content = content.replace(oldModelRegex, newModel);

// Replace DocumentType enum
const oldEnumRegex = /enum DocumentType \{[\s\S]*?OTHER\s*\}/g;
const newEnum = `enum DocumentType {
  AADHAAR
  PAN
  PASSPORT
  DRIVING_LICENSE
  VOTER_ID
  PHOTO
  RESUME
  OFFER_LETTER
  EXPERIENCE_CERTIFICATE
  DEGREE_CERTIFICATE
  SALARY_SLIP
  RELIEVING_LETTER
  OTHER
}`;

content = content.replace(oldEnumRegex, newEnum);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log("Schema updated.");
