package com.example.crud.controller;

import com.example.crud.model.Categoria;
import com.example.crud.service.CategoriaService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/categoria")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping("/formulario")
    public String exibirFormulario(Model model) {
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
        model.addAttribute("categorias", categoriaService.listar());
        return "categoria-lista";
    }

    @GetMapping("/editar/{id}")
    public String editar(@PathVariable Integer id, Model model) {
        model.addAttribute("categoria", categoriaService.buscarPorId(id));
        return "categoria-formulario";
    }

    @GetMapping("/deletar/{id}")
    public String deletar(@PathVariable Integer id) {
        categoriaService.deletar(id);
        return "redirect:/categoria/listar";
    }
}
