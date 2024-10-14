import { Injectable, StreamableFile } from '@nestjs/common';
import path, { join, dirname, basename, extname } from 'path';

const crypto = require("crypto");
const fs = require("fs");
const stream = require("stream");
const CryptoAlgorithm = "aes-256-cbc";

const secret = {
  iv: Buffer.from('efb2da92cff888c9c295dc4ee682789c', 'hex'),
  key: Buffer.from('6245cb9b8dab1c1630bb3283063f963574d612ca6ec60bc8a5d1e07ddd3f7c53', 'hex')
}

@Injectable()
export class AppService {

  uploadService(file: Express.Multer.File): string {
    //console.log("service: " + file.originalname);
    this.saveEncryptedFile(file.buffer, join("\encrypt", file.originalname), secret.key, secret.iv);
    return 'OK from here';
  }

  saveEncryptedFile(buffer, filePath, key, iv) {

    const encrypted = this.encrypt(CryptoAlgorithm, buffer, key, iv);
    filePath = this.getEncryptedFilePath(filePath);

    if (!fs.existsSync(dirname(filePath))) {
      fs.mkdirSync(dirname(filePath));
    };
    fs.writeFileSync(filePath, encrypted);

  };

  encrypt(algorithm, buffer, key, iv) {
    console.log('key:  ' + key);
    console.log('iv:  ' + iv);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return encrypted;
  };

  getEncryptedFilePath(filePath: string): string {
    return join(dirname(filePath), basename(filePath, extname(filePath)) + extname(filePath));
  };


  getFile(fileName: string): StreamableFile {

    const buffer = this.getEncryptedFile(join("./encrypt", fileName), secret.key, secret.iv);

    const readStream = new stream.PassThrough();
    readStream.end(buffer);

    const streamableFile = new StreamableFile(buffer, {
      type: 'application/text',
      disposition: 'attachment; filename="' + fileName + '"',
      length: buffer.length
    });

    return streamableFile;
  };

  getEncryptedFile(filePath: string, key: Buffer, iv: Buffer): any {
    filePath = this.getEncryptedFilePath(filePath);
    const encrypted = fs.readFileSync(filePath);
    const buffer = this.decrypt(CryptoAlgorithm, encrypted, key, iv);
    return buffer;
  };

  decrypt( algorithm: string, buffer, key, iv) : any {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
    
    return decrypted;
  }
}
