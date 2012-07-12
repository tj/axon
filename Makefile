
TESTS = $(wildcard test/test.*.js)

test:
	@./test/run $(TESTS)
	
.PHONY: test