package com.example.crud.model;

import jakarta.persistence.*;

@Entity
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(unique=true, nullable=false,length=100)
    private String nome;
    private String descricao;
    private double valor;
    private int quantidade;
    private String imagem;
    @ManyToOne
    @JoinColumn(name="categoria_id")
    private Categoria categoria;

    public Categoria getCategoria() {
        return categoria;
    }
    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public String getImagem() {
        return imagem;
    }

    public void setImagem(String imagem) {
        this.imagem = imagem;
    }

    public Produto(int id, String nome, String descricao, double valor, int quantidade, String imagem, Categoria categoria) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.valor = valor;
        this.quantidade = quantidade;
        this.imagem = imagem;
        this.categoria = categoria;
    }

    public Produto(Categoria categoria, String imagem, int quantidade, double valor, String descricao, String nome) {
        this.categoria = categoria;
        this.imagem = imagem;
        this.quantidade = quantidade;
        this.valor = valor;
        this.descricao = descricao;
        this.nome = nome;
    }

    public Produto(int id, String nome, String descricao, double valor, int quantidade, String imagem) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.valor = valor;
        this.quantidade = quantidade;
        this.imagem = imagem;
    }

    public Produto(String nome, String descricao, double valor, int quantidade, String imagem) {
        this.nome = nome;
        this.descricao = descricao;
        this.valor = valor;
        this.quantidade = quantidade;
        this.imagem = imagem;
    }

    public Produto() {
    }

    @Override
    public String toString() {
        return "Produto{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", descricao='" + descricao + '\'' +
                ", valor=" + valor +
                ", quantidade=" + quantidade +
                ", imagem='" + imagem + '\'' +
                ", categoria=" + categoria +
                '}';
    }
}
