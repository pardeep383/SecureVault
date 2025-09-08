// 📁 frontend/admin.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/admin/files')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#fileTable tbody');
            tbody.innerHTML = "";

            data.files.forEach(file => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = file.originalName;

                const dateCell = document.createElement('td');
                const date = new Date(Number(file.uploadDate));
                dateCell.textContent = date.toLocaleDateString();

                const linkCell = document.createElement('td');
                const link = document.createElement('a');
                link.href = file.downloadLink; // ✅ direct link
                link.textContent = "Download";
                link.target = "_blank";
                linkCell.appendChild(link);

                row.appendChild(nameCell);
                row.appendChild(dateCell);
                row.appendChild(linkCell);
                tbody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Failed to load files:", err);
        });
});
