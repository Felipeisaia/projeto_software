package com.example.crud.controller;

import com.example.crud.model.Produto;
import com.example.crud.repository.CategoriaRepository;
import com.example.crud.repository.ProdutoRepository;
import com.example.crud.service.ProdutoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/produto")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final CategoriaRepository categoriaRepository;

    public ProdutoController(ProdutoRepository produtoRepository, ProdutoService produtoService,
                             CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
        model.addAttribute("produto", new Produto());
        model.addAttribute("categorias", categoriaRepository.findAll());
        return "formulario";
    }

    @PostMapping("/salvar")
    public String salvarProduto(Produto produto) {
        produtoService.salvar(produto);
        return "redirect:/produto/listar";
    }

    @GetMapping("/listar")
    public String listarProdutos(Model model) {
        List<Produto> produtos = produtoRepository.findAll();
        model.addAttribute("produtos", produtos);
        return "lista";
    }

    @GetMapping("/deletar/{id}")
    public String excluirProduto(@PathVariable Integer id) {
        produtoRepository.deleteById(id);
        return "redirect:/produto/listar";
    }

    @GetMapping("/editar/{id}")
    public String editarProduto(@PathVariable Integer id, Model model) {
        Produto produto = produtoRepository.findById(id).orElse(null);
        model.addAttribute("produto", produto);
        model.addAttribute("categorias", categoriaRepository.findAll());
        return "formulario";
    }
}
