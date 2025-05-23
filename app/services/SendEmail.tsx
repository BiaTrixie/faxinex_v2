import axios from 'axios';

export const sendEmail = async (to: string, groupId: string) => {
  try {
    const response = await axios.post('https://backend-faxinex.vercel.app/send', {
      to: to,
      subject: 'Convite para Participar do Grupo',
      text:`Olá,

Você foi convidado a fazer parte de um grupo exclusivo em nossa plataforma! 

Para ingressar no grupo, utilize o código abaixo durante o processo de entrada:

Código do Grupo: ${groupId}

Estamos ansiosos para ter você conosco. Caso tenha dúvidas ou precise de ajuda, não hesite em entrar em contato.

Atenciosamente,  
Equipe Faxinex`,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erro ao enviar o email');
  }
};