def reduce_pc_size():
	# f = open("assets/Emma_pointcloud.txt", "r")
	# print(f.read(5))
	filepath = "../assets/Emma_pointcloud.txt"
	text_file = open("../assets/Emma_pointcloud_reduced.txt", "w")

	with open(filepath) as fp:
	   	# line = fp.readline()
	   	# line = fp.read
	   	for cnt, line in enumerate(fp):
	   		if cnt%25 == 0: #1 out of 25
	   			print(cnt)
	   			text_file.write(line)

	text_file.close()

if __name__ == "__main__":
	reduce_pc_size();