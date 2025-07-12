import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }
  async sendResetPasswordCode(email: string, code: string) {
  await this.transporter.sendMail({
    to: email,
    subject: 'Código para redefinição de senha',
    text: `Seu código é: ${code}`,
    html: `<p>Use o código abaixo para redefinir sua senha:</p><h2>${code}</h2>`,
  });
}
}
