// Teste das funções do dropdown
console.log('Testando funções do dropdown...');

// Simular clique no dropdown
function testDropdown() {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        console.log('Dropdown encontrado');
        dropdown.classList.toggle('active');
    } else {
        console.log('Dropdown não encontrado');
    }
}

// Executar teste após carregar a página
setTimeout(testDropdown, 2000);
