import paramiko, os, sys, time

sys.stdout.reconfigure(encoding='utf-8')

LOCAL_SITE = r'C:\Users\JPaulo Santos\Desktop\PROJETO SITE UNINOVARE\site'
REMOTE_DIR = '/var/www/uninovare'
HOST = '187.77.33.115'
USER = 'root'
PASS = 'Fms.75658165'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=15)
print('Conectado ao VPS')

# Limpar arquivos antigos do root (não apagar assets)
ssh.exec_command('rm -f /var/www/uninovare/*.html /var/www/uninovare/*.css /var/www/uninovare/*.js /var/www/uninovare/README.md /var/www/uninovare/*.txt /var/www/uninovare/*.xml')
time.sleep(1)

# Criar estrutura de pastas
dirs_to_create = [
    'css', 'js', 'data',
    'assets/logos', 'assets/banners', 'assets/cursos',
    'assets/professores', 'assets/equipe', 'assets/gallery'
]
for d in dirs_to_create:
    ssh.exec_command(f'mkdir -p {REMOTE_DIR}/{d}')
time.sleep(1)

sftp = ssh.open_sftp()
count = 0
errors = []

for root, dirs, files in os.walk(LOCAL_SITE):
    for f in files:
        local_path = os.path.join(root, f)
        rel = os.path.relpath(local_path, LOCAL_SITE)
        rel_unix = rel.replace(os.sep, '/')
        remote_path = REMOTE_DIR + '/' + rel_unix

        try:
            sftp.put(local_path, remote_path)
            count += 1
            print(f'  OK: {rel_unix}')
        except Exception as e:
            errors.append(f'{rel_unix}: {e}')
            print(f'  ERRO: {rel_unix} -> {e}')

sftp.close()

print(f'\nTotal enviados: {count}')
if errors:
    print(f'Erros: {len(errors)}')

# Verificar
stdin, stdout, stderr = ssh.exec_command(f'find {REMOTE_DIR} -type f | wc -l')
total = stdout.read().decode('utf-8').strip()
print(f'Arquivos no servidor: {total}')

# Reload nginx
stdin, stdout, stderr = ssh.exec_command('nginx -t && systemctl reload nginx')
time.sleep(1)
err = stderr.read().decode('utf-8').strip()
print(f'Nginx: {err}')

ssh.close()
print('\nDeploy concluido!')
