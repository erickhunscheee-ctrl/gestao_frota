// js/SyncService.js
class SyncService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.storageKey = 'verda_pending_registros';
    }

    async salvarRegistro(data) {
        if (navigator.onLine) {
            try {
                await this.enviarParaServidor(data);
                return { success: true, mode: 'online' };
            } catch (error) {
                this.guardarLocalmente(data);
                return { success: true, mode: 'offline' };
            }
        } else {
            this.guardarLocalmente(data);
            return { success: true, mode: 'offline' };
        }
    }

    guardarLocalmente(data) {
        let fila = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        fila.push({ ...data, id_temp: Date.now() });
        localStorage.setItem(this.storageKey, JSON.stringify(fila));
    }

    async enviarParaServidor(data) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro no servidor');
        return response.json();
    }

    async sincronizar() {
        let fila = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        if (fila.length === 0 || !navigator.onLine) return;

        for (let i = 0; i < fila.length; i++) {
            try {
                await this.enviarParaServidor(fila[i]);
                fila.splice(i, 1);
                i--;
            } catch (error) { console.error("Erro ao sincronizar item", error); }
        }
        localStorage.setItem(this.storageKey, JSON.stringify(fila));
    }
}