let watch = (cb) => {
  cb(1, 2)
}

watch((oldVal, newVal) => {
  console.log(oldVal, newVal, '----');
})