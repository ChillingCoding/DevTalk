import { describe, it, expect } from 'vitest';
import { apiPostToPostData } from '../src/pages/FeedPage';

/**
 * TIPO DE TESTE: TESTE UNITÁRIO (FRONTEND)
 * Objetivo: Validar a lógica de mapeamento e transformação de dados que chegam da API.
 */
describe('apiPostToPostData', () => {
  it('deve mapear corretamente os campos do backend para o formato do frontend', () => {
    const mockApiPost = {
      id_post: '123',
      email: 'teste@exemplo.com',
      descricao: 'Olá mundo!',
      image_url: 'http://imagem.jpg',
      data_publicacao: '2024-03-20T10:00:00Z',
      author: {
        name: 'Utilizador Teste',
        avatar: '/avatar.png',
        email: 'teste@exemplo.com'
      },
      likes: 5,
      comments: 2,
      isLiked: true
    };

    const result = apiPostToPostData(mockApiPost);

    expect(result.id).toBe('123');
    expect(result.content).toBe('Olá mundo!');
    expect(result.likes).toBe(5);
    expect(result.isLiked).toBe(true);
    expect(result.author.name).toBe('Utilizador Teste');
  });

  it('deve usar valores por defeito quando os campos estão em falta', () => {
    const minimalisticPost = {};
    const result = apiPostToPostData(minimalisticPost);

    expect(result.likes).toBe(0);
    expect(result.isLiked).toBe(false);
    expect(result.author.name).toBe('Membro appSocial');
  });

  it('deve lidar com image_url nulo corretamente', () => {
    const postSemImagem = { id_post: '1', descricao: 'sem imagem', image_url: null };
    const result = apiPostToPostData(postSemImagem);
    expect(result.image_url).toBeNull();
  });

  it('deve gerar um ID único se o id_post não for fornecido', () => {
    const postSemId = { descricao: 'teste' };
    const result = apiPostToPostData(postSemId);
    expect(result.id).toBeTypeOf('string');
    expect(result.id.length).toBeGreaterThan(0);
  });
});
