import nodemailer from 'nodemailer'
import { PASS } from './constants'

const transporter = nodemailer.createTransport({
  host: 'serwer1855895.home.pl',
  port: 465,
  secure: true,
  auth: {
    user: 'learn@olekh.pl',
    pass: PASS,
  }
});

const sendEmail = async (to, subject, text, html) => await transporter.sendMail({
  from: '"netOpen Support" <learn@olekh.pl>',
  to, 
  subject,
  text,
  html
})

export default sendEmail