package com.example.crud.controller;

import com.example.crud.model.Categoria;
import com.example.crud.repository.CategoriaRepository;
import com.example.crud.service.CategoriaService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/categoria")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaRepository categoriaRepository, CategoriaService categoriaService) {
        this.categoriaRepository = categoriaRepository;
        this.categoriaService = categoriaService;
    }

    @GetMapping("/formulario")
    public String formulario(Model model) {
        model.addAttribute("categoria", new Categoria());
        return "categoria-formulario";
    }

    @PostMapping("/salvar")
    public String salvar(Categoria categoria) {
        categoriaService.salvar(categoria);
        return "redirect:/categoria/listar";
    }

    @GetMapping("/listar")
    public String listar(Model model) {
        model.addAttribute("categorias", categoriaRepository.findAll());
        return "categoria-lista";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Integer id, Model model) {
        model.addAttribute("categoria", categoriaRepository.findById(id).orElseThrow());
        return "categoria-formulario";
    }

    @GetMapping("/deletar/{id}")
    public String deletar(@PathVariable Integer id) {
        categoriaRepository.deleteById(id);
        return "redirect:/categoria/listar";
    }
}