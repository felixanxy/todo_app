# outputs.tf - Terraform Outputs

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.todo_app.id
}

output "instance_public_ip" {
  description = "Public IP address of EC2 instance"
  value       = aws_eip.todo_app.public_ip
}

output "instance_public_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.todo_app.public_dns
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${aws_eip.todo_app.public_ip}"
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.todo_app.public_ip}"
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.todo_app.id
}