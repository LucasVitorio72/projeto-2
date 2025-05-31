
         // Quando o formulário for enviado
    document.getElementById("formLoguin").addEventListener("submit", function(event) {
      event.preventDefault(); // Evita que a página seja recarregada

      // Pegamos os valores digitados nos campos
      const usuario = document.getElementById("usuario").value;
      const senha = document.getElementById("senha").value;

      // Salvamos os valores no armazenamento local do navegador
      localStorage.setItem("usuario", usuario);
      localStorage.setItem("senha", senha);

      // Mostramos uma mensagem de sucesso
      alert("Dados salvos com sucesso!");

      // Atualiza a exibição dos dados salvos na tela
      mostrarDadosSalvos();
    });

    // Função que recupera os dados salvos e exibe na tela
    function mostrarDadosSalvos() {
      // Pegamos os dados do localStorage (se existirem)
      const usuarioSalvo = localStorage.getItem("usuario");
      const senhaSalva = localStorage.getItem("senha");

      // Verifica se existe algo salvo
      if (usuarioSalvo && senhaSalva) {
        // Monta o conteúdo em HTML para mostrar na tela
        document.getElementById("dadosSalvos").innerHTML = `
          <h3>Dados salvos:</h3>
          <p><strong>Usuário:</strong> ${usuarioSalvo}</p>
          <p><strong>Senha:</strong> ${senhaSalva}</p>
        `;
      }
    }

    // Ao carregar a página, mostramos os dados salvos (se houver)
    mostrarDadosSalvos();
 