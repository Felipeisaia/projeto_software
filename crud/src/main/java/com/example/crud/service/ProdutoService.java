package com.example.crud.service;

import com.example.crud.model.Produto;
import com.example.crud.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

@Service
public class ProdutoService {
    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public void salvar(Produto produto) {
        if(produto.getNome() == null || produto.getNome().isBlank()) {
            throw new RuntimeException("O nome do produto é obrigatório.");
        }
        if(produto.getValor() <= 0){
            throw new RuntimeException("O valor deve ser maior que zero.");
        }
        produtoRepository.save(produto);
    }
}
